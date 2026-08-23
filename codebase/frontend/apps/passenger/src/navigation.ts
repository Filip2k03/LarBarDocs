export type PassengerStage = 'ENTRY' | 'DISCOVERY' | 'PLANNING' | 'CHECKOUT' | 'DISPATCH' | 'PICKUP' | 'TRIP' | 'RECEIPT' | 'ACCOUNT' | 'SAFETY';

export type PassengerScreenId =
  | 'Splash' | 'Home' | 'PickupMap' | 'RouteFees' | 'ChooseRide' | 'Payment'
  | 'FindingDriver' | 'DriverOnTheWay' | 'DriverDetails' | 'OnTrip' | 'TripComplete'
  | 'MyTrips' | 'Profile' | 'Wallet' | 'GuardianPlugin' | 'SavedPlaces' | 'Support'
  | 'Notifications' | 'ScheduleRide' | 'Promotions' | 'Settings';

export interface PassengerScreenDefinition {
  id: PassengerScreenId;
  stage: PassengerStage;
  title: string;
  icon: string;
  next?: PassengerScreenId[];
}

export const passengerScreens: PassengerScreenDefinition[] = [
  { id: 'Splash', stage: 'ENTRY', title: 'Splash', icon: 'labar-mark', next: ['Home'] },
  { id: 'Home', stage: 'DISCOVERY', title: 'Home', icon: 'home', next: ['PickupMap', 'SavedPlaces', 'ScheduleRide'] },
  { id: 'PickupMap', stage: 'PLANNING', title: 'Pickup / Map', icon: 'map', next: ['RouteFees'] },
  { id: 'RouteFees', stage: 'PLANNING', title: 'Route & Fees', icon: 'route', next: ['ChooseRide'] },
  { id: 'ChooseRide', stage: 'PLANNING', title: 'Choose Ride', icon: 'ride', next: ['Payment'] },
  { id: 'Payment', stage: 'CHECKOUT', title: 'Payment', icon: 'payment', next: ['FindingDriver'] },
  { id: 'FindingDriver', stage: 'DISPATCH', title: 'Finding Driver', icon: 'finding', next: ['DriverOnTheWay'] },
  { id: 'DriverOnTheWay', stage: 'PICKUP', title: 'Driver On The Way', icon: 'route', next: ['DriverDetails', 'OnTrip'] },
  { id: 'DriverDetails', stage: 'PICKUP', title: 'Driver Details', icon: 'driver', next: ['OnTrip'] },
  { id: 'OnTrip', stage: 'TRIP', title: 'On Trip', icon: 'trip', next: ['TripComplete'] },
  { id: 'TripComplete', stage: 'RECEIPT', title: 'Trip Complete', icon: 'receipt', next: ['Home', 'MyTrips'] },
  { id: 'MyTrips', stage: 'ACCOUNT', title: 'My Trips', icon: 'history' },
  { id: 'Profile', stage: 'ACCOUNT', title: 'Profile', icon: 'profile' },
  { id: 'Wallet', stage: 'ACCOUNT', title: 'LaBar Credit', icon: 'wallet' },
  { id: 'GuardianPlugin', stage: 'SAFETY', title: 'Guardian Plugin', icon: 'guardian' },
  { id: 'SavedPlaces', stage: 'ACCOUNT', title: 'Saved Places', icon: 'places' },
  { id: 'Notifications', stage: 'ACCOUNT', title: 'Notifications', icon: 'notifications' },
  { id: 'Support', stage: 'ACCOUNT', title: 'Support', icon: 'support' },
  { id: 'ScheduleRide', stage: 'PLANNING', title: 'Schedule Ride', icon: 'schedule' },
  { id: 'Promotions', stage: 'ACCOUNT', title: 'Promotions', icon: 'promotions' },
  { id: 'Settings', stage: 'ACCOUNT', title: 'Settings', icon: 'settings' },
];
