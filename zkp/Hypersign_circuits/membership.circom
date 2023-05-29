pragma circom 2.0.0;

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
