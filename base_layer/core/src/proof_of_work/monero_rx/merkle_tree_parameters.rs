//  Copyright 2023, The Tari Project
//
//  Redistribution and use in source and binary forms, with or without modification, are permitted provided that the
//  following conditions are met:
//
//  1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following
//  disclaimer.
//
//  2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the
//  following disclaimer in the documentation and/or other materials provided with the distribution.
//
//  3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote
//  products derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES,
//  INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
//  DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
//  SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
//  SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
//  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE
//  USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

use std::convert::TryFrom;

use monero::VarInt;
use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Clone, Debug, PartialEq, Error, Deserialize, Serialize, Eq)]
pub enum MerkleTreeParametersError {
    #[error("Cannot have zero chains")]
    NumberOfChainZero,
}

// This is based on https://github.com/SChernykh/p2pool/blob/merge-mining/docs/MERGE_MINING.MD#merge-mining-tx_extra-tag-format
#[derive(Debug, Clone, PartialEq)]
pub struct MerkleTreeParameters {
    number_of_chains: u8,
    aux_nonce: u32,
}

impl MerkleTreeParameters {
    pub fn new(number_of_chains: u8, aux_nonce: u32) -> Result<MerkleTreeParameters, MerkleTreeParametersError> {
        if number_of_chains == 0u8 {
            return Err(MerkleTreeParametersError::NumberOfChainZero);
        }
        Ok(MerkleTreeParameters {
            number_of_chains,
            aux_nonce,
        })
    }

    pub fn from_varint(merkle_tree_varint: VarInt) -> MerkleTreeParameters {
        let bits = get_decode_bits(merkle_tree_varint.0);

        let number_of_chains = get_aux_chain_count(merkle_tree_varint.0, bits);
        let aux_nonce = get_aux_nonce(merkle_tree_varint.0, bits);
        MerkleTreeParameters {
            number_of_chains,
            aux_nonce,
        }
    }

    pub fn to_varint(&self) -> VarInt {
        // 1 is encoded as 0
        let num = self.number_of_chains.saturating_sub(1);
        let size = u8::try_from(num.leading_zeros())
            .expect("This cant fail, u8 can only have 8 leading 0's which will fit in 255");
        // size must be greater than 0, so saturating sub should be safe.
        let mut size_bits = encode_bits(7u8.saturating_sub(size));
        let mut n_bits = encode_aux_chain_count(self.number_of_chains);
        let mut nonce_bits = encode_aux_nonce(self.aux_nonce);
        // this wont underflow as max size will be size_bits(3) + n_bits(8) + nonce_bits(32) = 43
        let mut zero_bits = vec![0; 64 - size_bits.len() - n_bits.len() - nonce_bits.len()];
        zero_bits.append(&mut nonce_bits);
        zero_bits.append(&mut n_bits);
        zero_bits.append(&mut size_bits);

        let num: u64 = zero_bits.iter().fold(0, |result, &bit| (result << 1) ^ u64::from(bit));
        VarInt(num)
    }

    pub fn number_of_chains(&self) -> u8 {
        self.number_of_chains
    }

    pub fn aux_nonce(&self) -> u32 {
        self.aux_nonce
    }
}

fn get_decode_bits(num: u64) -> u8 {
    let bits_num: Vec<u8> = (0..=2).rev().map(|n| ((num >> n) & 1) as u8).collect();
    bits_num.iter().fold(0, |result, &bit| (result << 1) ^ bit)
}

fn encode_bits(num: u8) -> Vec<u8> {
    (0..=2).rev().map(|n| (num >> n) & 1).collect()
}

fn get_aux_chain_count(num: u64, bits: u8) -> u8 {
    let end = 3 + bits;
    let bits_num: Vec<u8> = (3..=end).rev().map(|n| ((num >> n) & 1) as u8).collect();
    (bits_num.iter().fold(0, |result, &bit| (result << 1) ^ bit)).saturating_add(1)
}

fn encode_aux_chain_count(num: u8) -> Vec<u8> {
    // 1 is encoded as 0
    let num = num.saturating_sub(1);
    if num == 0 {
        return vec![0];
    }
    let size = u8::try_from(num.leading_zeros())
        .expect("This cant fail, u8 can only have 8 leading 0's which will fit in 255");
    let bit_length = 8 - size;
    (0..bit_length).rev().map(|n| (num >> n) & 1).collect()
}

fn get_aux_nonce(num: u64, bits: u8) -> u32 {
    // 0,1,2 is storing bits, then amount of bits, then start at next bit to read
    let start = 3 + bits + 1;
    let end = start + 32;
    let bits_num: Vec<u32> = (start..=end).rev().map(|n| ((num >> n) & 1) as u32).collect();
    bits_num.iter().fold(0, |result, &bit| (result << 1) ^ bit)
}

fn encode_aux_nonce(num: u32) -> Vec<u8> {
    (0..=31).rev().map(|n| ((num >> n) & 1) as u8).collect()
}

#[cfg(test)]
mod test {
    use monero::VarInt;

    use crate::proof_of_work::monero_rx::{
        merkle_tree_parameters::{
            encode_aux_chain_count,
            encode_aux_nonce,
            encode_bits,
            get_aux_chain_count,
            get_aux_nonce,
            get_decode_bits,
        },
        MerkleTreeParameters,
    };

    #[test]
    fn en_decode_bits_test() {
        let num = 24u64; // 11000
        let bit = get_decode_bits(num);
        assert_eq!(bit, 0);
        let bits = encode_bits(0);
        let array = vec![0, 0, 0];
        assert_eq!(bits, array);

        let num = 0b1100000000000000000000000000000000000000000000000000000000000101;
        let bit = get_decode_bits(num);
        assert_eq!(bit, 5);
        let bits = encode_bits(5);
        let array = vec![1, 0, 1];
        assert_eq!(bits, array);

        let num = 0b0100000000000000000000000000000000000000000000000000000000000110;
        let bit = get_decode_bits(num);
        assert_eq!(bit, 6);
        let bits = encode_bits(6);
        let array = vec![1, 1, 0];
        assert_eq!(bits, array);

        let num = 0b1010000000000000000000000000000000000000000000000000000000000111;
        let bit = get_decode_bits(num);
        assert_eq!(bit, 7);
        let bits = encode_bits(7);
        let array = vec![1, 1, 1];
        assert_eq!(bits, array);

        let num = 0b0011000000000000000000000000000000000000000000000000000000000001;
        let bit = get_decode_bits(num);
        assert_eq!(bit, 1);
        let bits = encode_bits(1);
        let array = vec![0, 0, 1];
        assert_eq!(bits, array);
    }

    #[test]
    fn get_decode_aux_chain_test() {
        let num = 24u64; // 11000
        let aux_number = get_aux_chain_count(num, 0);
        assert_eq!(aux_number, 2);
        let bits = encode_aux_chain_count(2);
        let array: Vec<u8> = vec![1];
        assert_eq!(bits, array);

        let num = 0b1101111111100000000000000000000000000000000000000000011111110000;
        let aux_number = get_aux_chain_count(num, 7);
        assert_eq!(aux_number, 255);
        let bits = encode_aux_chain_count(255);
        let array = vec![1, 1, 1, 1, 1, 1, 1, 0];
        assert_eq!(bits, array);

        let num = 0b1100000000100000000000000000000000000000000000000000000000101101;
        let aux_number = get_aux_chain_count(num, 3);
        assert_eq!(aux_number, 6);
        let bits = encode_aux_chain_count(6);
        let array = vec![1, 0, 1];
        assert_eq!(bits, array);

        let num = 0b1100000000000000000000000000000000000000000000000000000000011101;
        let aux_number = get_aux_chain_count(num, 2);
        assert_eq!(aux_number, 4);
        let bits = encode_aux_chain_count(4);
        let array = vec![1, 1];
        assert_eq!(bits, array);

        let num = 0b1100111000000000000000000000000000000000000000000000000000000101;
        let aux_number = get_aux_chain_count(num, 1);
        assert_eq!(aux_number, 1);
        let bits = encode_aux_chain_count(1);
        let array = vec![0];
        assert_eq!(bits, array);

        let num = 0b1100000100000000000000000000000000000000000000000000000000111101;
        let aux_number = get_aux_chain_count(num, 3);
        assert_eq!(aux_number, 8);
        let bits = encode_aux_chain_count(8);
        let array = vec![1, 1, 1];
        assert_eq!(bits, array);

        let num = 0b1100000001000000000000000000000000000000000000000000000001111101;
        let aux_number = get_aux_chain_count(num, 4);
        assert_eq!(aux_number, 16);
        let bits = encode_aux_chain_count(16);
        let array = vec![1, 1, 1, 1];
        assert_eq!(bits, array);

        let num = 0b1100000010000000000000000000000000000000000000000000001111000101;
        let aux_number = get_aux_chain_count(num, 7);
        assert_eq!(aux_number, 121);
        let bits = encode_aux_chain_count(121);
        let array = vec![1, 1, 1, 1, 0, 0, 0];
        assert_eq!(bits, array);

        let num = 0b1100000100000000000000000000000000000000000000000000001100000101;
        let aux_number = get_aux_chain_count(num, 7);
        assert_eq!(aux_number, 97);
        let bits = encode_aux_chain_count(97);
        let array = vec![1, 1, 0, 0, 0, 0, 0];
        assert_eq!(bits, array);

        let num = 0b1111000110000000000000000000000000000000000000000000000111000101;
        let aux_number = get_aux_chain_count(num, 6);
        assert_eq!(aux_number, 57);
        let bits = encode_aux_chain_count(57);
        let array = vec![1, 1, 1, 0, 0, 0];
        assert_eq!(bits, array);
    }

    #[test]
    #[allow(clippy::too_many_lines)]
    fn get_decode_aux_nonce_test() {
        let num = 24u64; // 11000
        let aux_number = get_aux_nonce(num, 0);
        assert_eq!(aux_number, 1);
        let bits = encode_aux_nonce(1);
        let array = vec![
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        ];
        assert_eq!(bits, array);

        let num = 0b1100000000110000000000000000000000000000000000000000100000000101;
        let aux_number = get_aux_nonce(num, 7);
        assert_eq!(aux_number, 1);
        let bits = encode_aux_nonce(1);
        let array = vec![
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        ];
        assert_eq!(bits, array);

        let num = 0b1100000000110000000000000000000000000000000000000000010000000101;
        let aux_number = get_aux_nonce(num, 6);
        assert_eq!(aux_number, 1);
        let bits = encode_aux_nonce(1);
        let array = vec![
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        ];
        assert_eq!(bits, array);

        let num = 0b1100000000110000000000000000000000000000000000000000001000000101;
        let aux_number = get_aux_nonce(num, 5);
        assert_eq!(aux_number, 1);
        let bits = encode_aux_nonce(1);
        let array = vec![
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        ];
        assert_eq!(bits, array);

        let num = 0b1100000000110000000000000000000000000000000000000000000100000101;
        let aux_number = get_aux_nonce(num, 4);
        assert_eq!(aux_number, 1);
        let bits = encode_aux_nonce(1);
        let array = vec![
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        ];
        assert_eq!(bits, array);

        let num = 0b1100000000110000000000000000000000000000000000000000000010000101;
        let aux_number = get_aux_nonce(num, 3);
        assert_eq!(aux_number, 1);
        let bits = encode_aux_nonce(1);
        let array = vec![
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        ];
        assert_eq!(bits, array);

        let num = 0b1100000000110000000000000000000000000000000000000000000001000101;
        let aux_number = get_aux_nonce(num, 2);
        assert_eq!(aux_number, 1);
        let bits = encode_aux_nonce(1);
        let array = vec![
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        ];
        assert_eq!(bits, array);

        let num = 0b1100000000110000000000000000000000000000000000000000000000100101;
        let aux_number = get_aux_nonce(num, 1);
        assert_eq!(aux_number, 1);
        let bits = encode_aux_nonce(1);
        let array = vec![
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        ];
        assert_eq!(bits, array);

        let num = 0b1100000000110000000000000000000000000000000000000000000000010101;
        let aux_number = get_aux_nonce(num, 0);
        assert_eq!(aux_number, 1);
        let bits = encode_aux_nonce(1);
        let array = vec![
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        ];
        assert_eq!(bits, array);

        let num = 0b1100000000110000000000000000000000000000000000000000010000000101;
        let aux_number = get_aux_nonce(num, 7);
        assert_eq!(aux_number, 0);
        let bits = encode_aux_nonce(0);
        let array = vec![
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        ];
        assert_eq!(bits, array);

        let num = 0b1100000000110000000001111111111111111111111111111111110000000101;
        let aux_number = get_aux_nonce(num, 7);
        assert_eq!(aux_number, u32::MAX);
        let bits = encode_aux_nonce(u32::MAX);
        let array = vec![
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        ];
        assert_eq!(bits, array);

        let num = 0b1100000000110000000001111111111100011111111111111111110000000101;
        let aux_number = get_aux_nonce(num, 7);
        assert_eq!(aux_number, 4293132287);
        let bits = encode_aux_nonce(4293132287);
        let array = vec![
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        ];
        assert_eq!(bits, array);

        let num = 0b1100000000110000000001010101010101010101010101010101010000000101;
        let aux_number = get_aux_nonce(num, 7);
        assert_eq!(aux_number, 2863311530);
        let bits = encode_aux_nonce(2863311530);
        let array = vec![
            1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0,
        ];
        assert_eq!(bits, array);

        let num = 0b110000000011000000000000000000000000011110011110111010000000101;
        let aux_number = get_aux_nonce(num, 7);
        assert_eq!(aux_number, 31214);
        let bits = encode_aux_nonce(31214);
        let array = vec![
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0,
        ];
        assert_eq!(bits, array);
    }

    #[test]
    fn merkle_complete() {
        let num = VarInt(24);
        let merkle_tree_params = MerkleTreeParameters::from_varint(num);
        assert_eq!(merkle_tree_params.aux_nonce, 1);
        assert_eq!(merkle_tree_params.number_of_chains, 2);

        let ser_num = merkle_tree_params.to_varint();
        assert_eq!(ser_num, VarInt(24));
    }

    mod quicktest {
        use quickcheck::{quickcheck, Arbitrary, Gen};

        use crate::proof_of_work::monero_rx::MerkleTreeParameters;

        impl Arbitrary for MerkleTreeParameters {
            fn arbitrary(g: &mut Gen) -> MerkleTreeParameters {
                let mut mt = MerkleTreeParameters {
                    number_of_chains: u8::arbitrary(g),
                    aux_nonce: u32::arbitrary(g),
                };
                if mt.number_of_chains == 0 {
                    mt.number_of_chains = 1;
                };
                mt
            }
        }

        #[test]
        fn test_ser_deserialize() {
            fn varint_serialization(mt_params: MerkleTreeParameters) -> bool {
                let varint = mt_params.to_varint();
                let deserialize = MerkleTreeParameters::from_varint(varint);
                mt_params == deserialize
            }
            quickcheck(varint_serialization as fn(MerkleTreeParameters) -> bool)
        }
    }
}
