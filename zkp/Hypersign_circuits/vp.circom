pragma circom 2.0.0;

include "../circuits/smt/smtverifier.circom";
include "../circuits/eddsaposeidon.circom";


include "../circuits/comparators.circom";


template SetMembership(n) {
    signal input x;
    signal input set[n];
    signal output out;

    signal intermediate[n];
    
    intermediate[0] <== x - set[0];
    for (var i=1; i<n; i++) {
        intermediate[i] <== intermediate[i-1] * (x - set[i]);
    }

    component isz = IsZero();
    isz.in <== intermediate[n-1];

    isz.out ==> out;
}

// verifiable Presentation circuit
template vp(n_attr,n) {
    signal input set[n]; 
    signal input key;
signal input attributes[n_attr];
signal output exposed_attributes[n_attr];
signal output issuer_id_out;
signal output set_membership_out;

 signal input credential_lemma;  // Root of the credential sparse merkle tree
signal input issuer_pk[2];
signal input issuer_signature[3]; // Verifiable credential signature
signal input siblings[10];
signal input issuer_id;
component smt=SMTVerifier(10);
smt.enabled<==1;
smt.root<==credential_lemma;
smt.siblings<==siblings;
smt.key<==key;
smt.oldKey<==0;
smt.oldValue<==0;
smt.isOld0<==0;
smt.value<==attributes[1];
smt.fnc<==0;

component ecdsa=EdDSAPoseidonVerifier();

ecdsa.enabled<==1;
ecdsa.Ax<==issuer_pk[0];
ecdsa.Ay<==issuer_pk[1];
ecdsa.R8x<==issuer_signature[0];
ecdsa.R8y<==issuer_signature[1];
ecdsa.S<==issuer_signature[2];
ecdsa.M<==credential_lemma;


exposed_attributes[2] <== attributes[2];

issuer_id_out<==issuer_id;
component set_membership=SetMembership(n);
set_membership.x<==attributes[1];
set_membership.set<==set;
set_membership_out<==set_membership.out;




signal input challenge;
signal input holder_pk[2];
signal input holder_signature[3]; // Verifiable presentation signature


// verify the holder signature
component ecdsaH=EdDSAPoseidonVerifier();

ecdsaH.enabled<==1;
ecdsaH.Ax<==holder_pk[0];
ecdsaH.Ay<==holder_pk[1];
ecdsaH.R8x<==holder_signature[0];
ecdsaH.R8y<==holder_signature[1];
ecdsaH.S<==holder_signature[2];
ecdsaH.M<==challenge;


}


component main = vp(4,5);