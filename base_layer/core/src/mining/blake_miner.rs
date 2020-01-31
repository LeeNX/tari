// Copyright 2019. The Tari Project
//
// Redistribution and use in source and binary forms, with or without modification, are permitted provided that the
// following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following
// disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the
// following disclaimer in the documentation and/or other materials provided with the distribution.
//
// 3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote
// products derived from this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES,
// INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
// WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE
// USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

use crate::{
    blocks::BlockHeader,
    proof_of_work::{Difficulty, ProofOfWork},
};
use rand::{rngs::OsRng, RngCore};
use serde::{Deserialize, Serialize};
use std::sync::{
    atomic::{AtomicBool, Ordering},
    Arc,
};
use tari_utilities::epoch_time::EpochTime;

/// A simple Blake2b-based proof of work. This is currently intended to be used for testing and perhaps Testnet until
/// Monero merge-mining is active.
///
/// The proof of work difficulty is given by `H256(H512(header || nonce))` where Hnnn is the Blake2b digest of length
/// `nnn` bits.
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct CpuBlakePow;

impl CpuBlakePow {
    /// A simple miner. It starts with a random nonce and iterates until it finds a header hash that meets the desired
    /// target
    pub fn mine(
        target_difficulty: Difficulty,
        mut header: BlockHeader,
        stop_flag: Arc<AtomicBool>,
        kill_flag: Arc<AtomicBool>,
    ) -> Option<BlockHeader>
    {
        let mut nonce: u64 = OsRng.next_u64();
        let start_nonce = nonce;
        // We're mining over here!
        let difficulty = ProofOfWork::achieved_difficulty(&header);
        while difficulty < target_difficulty {
            if stop_flag.load(Ordering::Relaxed) || kill_flag.load(Ordering::Relaxed) {
                return None;
            }
            if nonce == std::u64::MAX {
                nonce = 0;
            } else {
                nonce += 1;
            }
            if nonce == start_nonce {
                header.timestamp = EpochTime::now();
            }
            header.nonce = nonce;
        }
        Some(header)
    }
}
