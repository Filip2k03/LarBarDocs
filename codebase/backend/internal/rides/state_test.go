package rides

import "testing"

func TestRideStateMachine(t *testing.T) {
	valid := [][2]Status{{Requested, Searching}, {Searching, DriverOffered}, {DriverOffered, DriverAssigned}, {DriverAssigned, DriverEnroute}, {DriverEnroute, DriverArrived}, {DriverArrived, PickupConfirmed}, {PickupConfirmed, InProgress}, {InProgress, Completed}, {Searching, NoDriverFound}}
	for _, transition := range valid {
		if err := ValidateTransition(transition[0], transition[1]); err != nil {
			t.Fatalf("expected %s to %s: %v", transition[0], transition[1], err)
		}
	}
	invalid := [][2]Status{{Requested, Completed}, {Searching, InProgress}, {Completed, Searching}, {DriverArrived, Completed}}
	for _, transition := range invalid {
		if err := ValidateTransition(transition[0], transition[1]); err == nil {
			t.Fatalf("expected %s to %s to fail", transition[0], transition[1])
		}
	}
}
