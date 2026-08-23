package auth

import "testing"

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
