package auth

import (
	"testing"

	"golang.org/x/crypto/bcrypt"
)

func TestNormalizePhone(t *testing.T) {
	cases := map[string]string{"09 123-456-789": "+959123456789", "+959123456789": "+959123456789"}
	for input, want := range cases {
		got, err := NormalizePhone(input)
		if err != nil || got != want {
			t.Fatalf("NormalizePhone(%q)=%q,%v want %q", input, got, err, want)
		}
	}
	for _, invalid := range []string{"", "0912", "959123", "+95invalid"} {
		if _, err := NormalizePhone(invalid); err == nil {
			t.Fatalf("expected %q invalid", invalid)
		}
	}
}

func TestHashStaffPassword(t *testing.T) {
	hash, err := HashStaffPassword("a-long-unique-staff-password")
	if err != nil {
		t.Fatal(err)
	}
	if err = bcrypt.CompareHashAndPassword([]byte(hash), []byte("a-long-unique-staff-password")); err != nil {
		t.Fatal("generated staff password hash does not verify")
	}
	if _, err = HashStaffPassword("too-short"); err == nil {
		t.Fatal("expected short staff password to be rejected")
	}
}

func TestStaffRolesAreNarrow(t *testing.T) {
	if !hasStaffRole([]string{"marketer"}) || !hasStaffRole([]string{"driver_registrar"}) || !hasStaffRole([]string{"registration_manager"}) {
		t.Fatal("expected DriverReg staff roles to be accepted")
	}
	if hasStaffRole([]string{"driver", "passenger", "admin", "super_admin"}) {
		t.Fatal("non-registration roles must not authenticate to DriverReg")
	}
}
