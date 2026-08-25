package driverreg

import "testing"

func TestMaskPhone(t *testing.T) {
	if got, want := maskPhone("+959123456789"), "+959******789"; got != want {
		t.Fatalf("maskPhone()=%q want %q", got, want)
	}
	if got := maskPhone("123"); got != "******" {
		t.Fatalf("short phone was not fully masked: %q", got)
	}
}
