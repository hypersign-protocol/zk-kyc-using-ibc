use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use cosmwasm_std::Addr;
use cw_storage_plus::Item;

use bellman::groth16::{ Proof, VerifyingKey, PreparedVerifyingKey };
use bellman::groth16::prepare_verifying_key;
use bls12_381::{ G1Affine, G2Affine, Bls12, Scalar };

#[derive(Serialize, Deserialize)]
pub struct VkeyStr {
    pub alpha_1: Vec<u8>,
    pub beta_2: Vec<u8>,
    pub gamma_2: Vec<u8>,
    pub delta_2: Vec<u8>,
    pub ic: Vec<Vec<u8>>,
}

#[derive(Serialize, Deserialize)]
pub struct ProofStr {
    pub pi_a: Vec<u8>,
    pub pi_b: Vec<u8>,
    pub pi_c: Vec<u8>,
}

pub fn get_verification_key() -> PreparedVerifyingKey<Bls12> {
    let verification_key_str = r#"{"alpha_1":[1,121,134,99,41,54,81,253,195,98,243,212,241,207,122,103,217,246,222,150,30,251,143,146,110,249,89,79,31,55,109,193,157,10,188,153,208,210,243,253,14,252,73,96,92,91,128,93,25,118,103,255,22,38,215,40,150,40,181,155,74,218,6,5,36,234,31,161,133,116,154,31,114,221,125,132,197,178,212,78,48,179,15,87,44,49,59,196,14,206,145,214,229,135,139,18],"beta_2":[23,207,86,94,128,35,85,131,185,197,135,47,61,87,154,77,230,186,5,169,217,203,15,24,150,51,1,65,45,198,185,203,138,221,84,27,13,117,110,104,66,34,74,205,117,255,31,31,14,7,191,86,18,83,155,113,2,21,143,221,153,137,254,120,92,230,229,213,73,242,192,231,192,135,16,90,196,210,184,67,49,234,175,110,162,107,59,239,89,20,188,140,242,43,33,157,14,61,10,172,37,240,77,30,22,209,125,246,92,68,55,37,60,24,240,225,167,109,91,8,27,50,245,52,236,41,225,137,72,255,4,47,76,18,91,155,150,14,20,37,188,34,105,74,21,149,5,214,227,54,49,87,114,180,87,147,194,66,198,136,183,65,212,127,174,63,19,236,200,126,132,180,184,25,234,146,243,164,249,199,212,40,109,143,144,27,194,12,52,217,70,245],"gamma_2":[19,224,43,96,82,113,159,96,125,172,211,160,136,39,79,101,89,107,208,208,153,32,182,26,181,218,97,187,220,127,80,73,51,76,241,18,19,148,93,87,229,172,125,5,93,4,43,126,2,74,162,178,240,143,10,145,38,8,5,39,45,197,16,81,198,228,122,212,250,64,59,2,180,81,11,100,122,227,209,119,11,172,3,38,168,5,187,239,212,128,86,200,193,33,189,184,6,6,196,160,46,167,52,204,50,172,210,176,43,194,139,153,203,62,40,126,133,167,99,175,38,116,146,171,87,46,153,171,63,55,13,39,92,236,29,161,170,169,7,95,240,95,121,190,12,229,213,39,114,125,110,17,140,201,205,198,218,46,53,26,173,253,155,170,140,189,211,167,109,66,154,105,81,96,209,44,146,58,201,204,59,172,162,137,225,147,84,134,8,184,40,1],"delta_2":[24,110,130,23,197,106,213,235,137,121,211,9,103,37,174,57,122,238,97,190,10,206,181,23,234,53,120,28,164,193,183,94,80,102,115,133,193,200,6,9,63,33,47,224,233,205,210,239,11,23,120,118,198,247,194,106,166,7,54,127,21,170,63,99,70,197,164,14,153,168,38,150,68,90,124,83,203,189,246,192,236,200,47,85,30,96,99,150,62,154,62,102,31,254,44,195,5,75,216,208,239,50,152,6,49,201,215,134,156,139,24,46,79,156,210,16,68,212,170,26,104,113,249,228,24,226,222,170,90,1,80,175,176,185,227,180,129,163,134,178,125,136,234,206,2,112,129,202,171,7,75,230,220,24,187,180,211,68,124,158,98,192,208,106,196,211,168,251,160,171,229,81,62,50,166,58,143,169,112,155,207,214,220,20,219,142,167,249,97,109,235,44],"ic":[[6,88,48,60,182,97,60,147,120,213,174,72,203,200,241,228,133,223,241,204,180,225,80,82,142,217,110,182,219,234,53,109,192,170,89,115,1,138,76,111,205,237,144,31,155,133,153,235,23,94,110,176,47,68,22,133,81,73,89,223,84,75,54,210,17,61,114,149,98,47,107,216,139,241,147,241,44,238,203,57,169,155,182,96,181,255,234,138,11,235,243,29,50,171,100,79],[8,56,255,136,53,114,2,189,46,169,241,121,62,59,250,149,144,46,176,135,69,110,249,26,12,9,206,229,142,18,173,86,253,101,12,207,63,170,253,158,196,117,27,251,79,163,25,100,1,107,157,31,241,83,153,102,41,18,160,191,237,122,169,189,156,234,198,139,79,104,51,251,101,178,92,22,219,211,46,193,69,22,76,104,224,151,212,53,210,56,117,73,225,134,120,3]]}"#;
    let v_key = verification_key_str.to_string();
    let vk: VkeyStr = serde_json::from_str(&v_key).unwrap();
    let vk_alpha_1 = vk.alpha_1;
    let vk_beta_2 = vk.beta_2;
    let vk_gamma_2 = vk.gamma_2;
    let vk_delta_2 = vk.delta_2;
    let vk_ic = vk.ic;
    
    let mut alpha1: [u8; 96] = [0; 96];
    let mut beta2: [u8; 192] = [0; 192];
    let mut gamma2: [u8; 192] = [0; 192];
    let mut delta2: [u8; 192] = [0; 192];
    let mut ic_0: [u8; 96] = [0; 96];
    let mut ic_1: [u8; 96] = [0; 96];
    let mut ic = Vec::new();

    for i in 0..vk_alpha_1.len() {
        alpha1[i] = vk_alpha_1[i];
    }

    for i in 0..vk_beta_2.len() {
        beta2[i] = vk_beta_2[i];
    }

    for i in 0..vk_gamma_2.len() {
        gamma2[i] = vk_gamma_2[i];
    }

    for i in 0..vk_delta_2.len() {
        delta2[i] = vk_delta_2[i];
    }

    for i in 0..vk_ic[0].len() {
        ic_0[i] = vk_ic[0][i];
    }

    for i in 0..vk_ic[1].len() {
        ic_1[i] = vk_ic[1][i];
    }
    let alpha1_affine = G1Affine::from_uncompressed(&alpha1).unwrap();
    let beta2_affine = G2Affine::from_uncompressed(&beta2).unwrap();
    let gamma2_affine = G2Affine::from_uncompressed(&gamma2).unwrap();
    let delta2_affine = G2Affine::from_uncompressed(&delta2).unwrap();
    let ic0_affine = G1Affine::from_uncompressed(&ic_0).unwrap();
    let ic1_affine = G1Affine::from_uncompressed(&ic_1).unwrap();
    ic.push(ic0_affine);
    ic.push(ic1_affine);

    let vkk: VerifyingKey<Bls12> = VerifyingKey{
        alpha_g1: alpha1_affine,
        beta_g1: G1Affine::identity(),
        beta_g2: beta2_affine,
        gamma_g2: gamma2_affine,
        delta_g1: G1Affine::identity(),
        delta_g2: delta2_affine,
        ic,
    };
    prepare_verifying_key(&vkk)
}

pub fn process_proof(proof: String) -> Proof<Bls12> {
    let pof: ProofStr = serde_json::from_str(&proof).unwrap();
    let pi_a = pof.pi_a;
    let pi_b = pof.pi_b;
    let pi_c = pof.pi_c;
    let mut a_arr: [u8; 96] = [0; 96];
    let mut b_arr: [u8; 192] = [0; 192];
    let mut c_arr: [u8; 96] = [0; 96];
    for i in 0..pi_a.len() {
        a_arr[i] = pi_a[i];
    }

    for i in 0..pi_b.len() {
        b_arr[i] = pi_b[i];
    }

    for i in 0..pi_c.len() {
        c_arr[i] = pi_c[i];
    }
    let pia_affine = G1Affine::from_uncompressed(&a_arr).unwrap();
    let pib_affine = G2Affine::from_uncompressed(&b_arr).unwrap();
    let pic_affine = G1Affine::from_uncompressed(&c_arr).unwrap();
    let proof: Proof<Bls12> = Proof {
        a: pia_affine,
        b: pib_affine,
        c: pic_affine,
    };
    proof
}

pub fn get_public_signal(value: u64) -> Vec<Scalar> {
    vec![Scalar::from(value)]
}