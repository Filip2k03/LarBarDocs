# Dispatch

Dispatch searches Redis GEO using expanding radii, then PostgreSQL rechecks each candidate: approved driver, fresh heartbeat, available state, approved active vehicle, supported service and no conflicting offer/trip.

Offers expire after 15 seconds. Acceptance locks offer and ride in a serializable transaction so one driver wins. Rejection and timeout restore availability and requeue search. Exhausted search ends in `no_driver_found`. Redis is never the source of approval or assignment truth.
