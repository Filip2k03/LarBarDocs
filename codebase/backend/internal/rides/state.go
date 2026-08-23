package rides

import "errors"

type Status string

const (
	Requested          Status = "requested"
	Searching          Status = "searching"
	DriverOffered      Status = "driver_offered"
	DriverAssigned     Status = "driver_assigned"
	DriverEnroute      Status = "driver_enroute"
	DriverArrived      Status = "driver_arrived"
	PickupConfirmed    Status = "pickup_confirmed"
	InProgress         Status = "in_progress"
	Completed          Status = "completed"
	PassengerCancelled Status = "passenger_cancelled"
	DriverCancelled    Status = "driver_cancelled"
	SystemCancelled    Status = "system_cancelled"
	NoDriverFound      Status = "no_driver_found"
)

var ErrInvalidTransition = errors.New("ride state transition invalid")
var transitions = map[Status]map[Status]bool{
	Requested:       {Searching: true, PassengerCancelled: true, SystemCancelled: true},
	Searching:       {DriverOffered: true, NoDriverFound: true, PassengerCancelled: true, SystemCancelled: true},
	DriverOffered:   {DriverAssigned: true, Searching: true, PassengerCancelled: true, SystemCancelled: true},
	DriverAssigned:  {DriverEnroute: true, DriverCancelled: true, PassengerCancelled: true, SystemCancelled: true},
	DriverEnroute:   {DriverArrived: true, DriverCancelled: true, PassengerCancelled: true, SystemCancelled: true},
	DriverArrived:   {PickupConfirmed: true, DriverCancelled: true, PassengerCancelled: true, SystemCancelled: true},
	PickupConfirmed: {InProgress: true, SystemCancelled: true},
	InProgress:      {Completed: true, SystemCancelled: true},
}

func CanTransition(from, to Status) bool { return transitions[from][to] }
func ValidateTransition(from, to Status) error {
	if !CanTransition(from, to) {
		return ErrInvalidTransition
	}
	return nil
}
