//  Copyright 2022, The Tari Project
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

use std::{fmt, fmt::Display, sync::Arc};

use tari_common::configuration::Network;
use tari_common_types::tari_address::TariAddress;
use tari_comms::peer_manager::NodeIdentity;
use tari_core::transactions::key_manager::TariKeyId;

#[derive(Clone, Debug)]
pub struct WalletIdentity {
    pub node_identity: Arc<NodeIdentity>,
    pub address: TariAddress,
    pub wallet_node_key_id: TariKeyId,
}

impl WalletIdentity {
    pub fn new(node_identity: Arc<NodeIdentity>, address: TariAddress) -> Self {
        let wallet_node_key_id = TariKeyId::Imported {
            key: node_identity.public_key().clone(),
        };
        WalletIdentity {
            node_identity,
            address,
            wallet_node_key_id,
        }
    }

    pub fn network(&self) -> Network {
        self.address.network()
    }
}

impl Display for WalletIdentity {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        writeln!(f, "{}", self.node_identity)?;
        writeln!(f, "Tari Address: {}", self.address)?;
        writeln!(f, "Network: {:?}", self.address.network())?;
        Ok(())
    }
}
