# Next-Generation Taxi Application: Architecture & UML 2.5 System Design Specification

## 1. Executive Summary & System Overview

This document presents the complete architectural blueprint and UML 2.5 specification for the **Next-Generation Taxi Application Platform**. The system is built with high concurrency, real-time safety telemetry, and instant financial settlement as top priorities.

### 1.1 Core Technological Pillars
- **Backend Core**: **Go (Golang 1.22+)** with Clean Architecture, Goroutines for concurrent geospatial processing, gRPC and WebSockets for low-latency bidirectional telemetry, and asynchronous worker pools.
- **Client Tier**: **Native Mobile Applications** (iOS via Swift 5.10 / SwiftUI and Android via Kotlin 2.0 / Jetpack Compose) for hardware-accelerated mapping, in-car CCTV video capture via AVFoundation/CameraX, and native OS deep-linking for mobile wallets.
- **Geospatial & Persistence Tier**: **PostgreSQL 16 + PostGIS** for complex spatial queries and long-term transactional records, and **Redis 7 Cluster** for real-time driver spatial indexing (`GEOADD`, `GEORADIUS`), distributed locks (`Redlock`), and Pub/Sub message dispatching.
- **Security & Safety Ecosystem**: Dual-shield safety combining **Passenger Guardian Mode** (live GPS streaming to designated family members with automated route-deviation alerts) and **Driver Protecting Mode** (automated in-car CCTV video recording, high-frequency GPS logging, and tamper-proof SHA-256 cloud archiving).
- **Payment & Financial Engine**: Hybrid multi-channel checkout supporting **Cash** and **Cashless E-Wallets** (KBZPay, AYAPay, WavePay) with cryptographic webhook verification, instant driver wallet balance crediting, and on-demand payout disbursement.

---

## 2. UML 2.5 Essential Diagrams & Flows

---

### 2.1 Use Case Diagram (UML 2.5)

The Use Case Diagram defines the interactions between human actors (**Passenger**, **Driver**, **Guardian**) and supporting systems (**Payment Gateway**, **Cloud Storage**, **Routing Engine**).

```mermaid
flowchart LR
    %% Actors
    subgraph Actors ["Primary & Supporting Actors"]
        direction TB
        Passenger["fa:fa-user Passenger\n(User App)"]
        Driver["fa:fa-id-card Driver\n(Driver App)"]
        Guardian["fa:fa-shield-alt Guardian / Family\n(Guardian App Mode)"]
        PaymentGW["fa:fa-credit-card Payment Gateway\n(KBZPay / AYAPay)"]
        CloudStorage["fa:fa-cloud Cloud CCTV Storage\n(S3 / Media Service)"]
        MapService["fa:fa-map-marked-alt Routing Engine\n(OSRM / Maps API)"]
    end

    %% System Boundary
    subgraph TaxiSystem ["Taxi Application System Boundary"]
        direction TB

        %% Authentication & User Management
        subgraph SubAuth ["1. Authentication & Profile Management"]
            UC_Register(["UC-01: Register / First Login"])
            UC_ManageProfile(["UC-02: Manage User/Driver Profile"])
            UC_ManageFavorites(["UC-03: Manage Favorite Locations"])
            UC_ManageFamily(["UC-04: Add / Manage Family Members"])
            UC_DriverAuth(["UC-05: Driver Login & Verification"])
            UC_DriverStatus(["UC-06: Toggle Driver Status\n(Available / Break / On Duty)"])
        end

        %% Booking & Dispatching
        subgraph SubBooking ["2. Ride Booking & Intelligent Dispatch"]
            UC_SelectPickup(["UC-07: Choose Ride Pickup Point\n(Current/Map/Search/Fav)"])
            UC_SelectDest(["UC-08: Choose Destination Point\n(Map/Search/Fav)"])
            UC_AddStops(["UC-09: Add Extra Waypoints/Stops"])
            UC_EstimateFare(["UC-10: Calculate Route & Estimated Fare"])
            UC_CallTaxi(["UC-11: Request Taxi (Call Now)"])
            UC_Dispatch(["UC-12: Dispatch to Nearest Available Driver"])
            UC_AcceptReject(["UC-13: Accept / Reject Ride Request"])
            UC_ReassignDriver(["UC-14: Cascade to Next Nearest Driver"])
            UC_LiveTrackingPickup(["UC-15: Track Taxi En Route to Pickup"])
            UC_Chat(["UC-16: In-App Chat (Passenger <-> Driver)"])
        end

        %% Ride Execution & Safety
        subgraph SubRideSafety ["3. Ride Execution & Safety Protection"]
            UC_StartRide(["UC-17: Start Ride & Trip Metering"])
            UC_ActivateGuardian(["UC-18: Activate Guardian Mode"])
            UC_ShareLocation(["UC-19: Stream Real-Time GPS to Guardian"])
            UC_RouteDeviationAlert(["UC-20: Detect & Trigger Off-Route Alert"])
            UC_ActivateProtecting(["UC-21: Activate Protecting Mode (CCTV & GPS Log)"])
            UC_StreamCCTV(["UC-22: Securely Stream / Upload CCTV to Cloud"])
            UC_CompleteRide(["UC-23: Arrive at Destination & Finalize Fare"])
        end

        %% Payment & Settlement
        subgraph SubPayment ["4. Payment Processing & Driver Settlement"]
            UC_SelectPayment(["UC-24: Select Payment Method (Cash / Cashless)"])
            UC_PayCash(["UC-25: Process Cash Payment & Confirmation"])
            UC_PayCashless(["UC-26: Pay via E-Wallet (KPay / AYAPay Deep-link)"])
            UC_VerifyPayment(["UC-27: Verify Payment Webhook / Transaction"])
            UC_DeactivateSafety(["UC-28: Deactivate Guardian & Protecting Modes"])
            UC_DriverSalesSummary(["UC-29: View Daily Sales & Orders Summary"])
            UC_DriverPayout(["UC-30: Transfer Sales / Payout to Driver Wallet"])
        end
    end

    %% Actor Relationships - Passenger
    Passenger --> UC_Register
    Passenger --> UC_ManageProfile
    Passenger --> UC_ManageFavorites
    Passenger --> UC_ManageFamily
    Passenger --> UC_SelectPickup
    Passenger --> UC_SelectDest
    Passenger --> UC_CallTaxi
    Passenger --> UC_LiveTrackingPickup
    Passenger --> UC_Chat
    Passenger --> UC_StartRide
    Passenger --> UC_SelectPayment

    %% Actor Relationships - Driver
    Driver --> UC_DriverAuth
    Driver --> UC_DriverStatus
    Driver --> UC_AcceptReject
    Driver --> UC_Chat
    Driver --> UC_StartRide
    Driver --> UC_CompleteRide
    Driver --> UC_PayCash
    Driver --> UC_DriverSalesSummary
    Driver --> UC_DriverPayout

    %% Actor Relationships - Guardian
    Guardian --> UC_ShareLocation
    Guardian --> UC_RouteDeviationAlert

    %% Actor Relationships - External Systems
    UC_EstimateFare --> MapService
    UC_RouteDeviationAlert --> MapService
    UC_StreamCCTV --> CloudStorage
    UC_PayCashless --> PaymentGW
    UC_VerifyPayment --> PaymentGW
    UC_DriverPayout --> PaymentGW

    %% Use Case Associations & Extensions (UML 2.5 Stereotypes)
    UC_SelectDest -.->|<<extend>>| UC_AddStops
    UC_CallTaxi -.->|<<include>>| UC_EstimateFare
    UC_CallTaxi -.->|<<include>>| UC_Dispatch
    UC_Dispatch -.->|<<include>>| UC_AcceptReject
    UC_AcceptReject -.->|<<extend>>| UC_ReassignDriver
    UC_AcceptReject -.->|<<include>>| UC_LiveTrackingPickup
    UC_LiveTrackingPickup -.->|<<extend>>| UC_Chat
    UC_StartRide -.->|<<include>>| UC_ActivateGuardian
    UC_StartRide -.->|<<include>>| UC_ActivateProtecting
    UC_ActivateGuardian -.->|<<include>>| UC_ShareLocation
    UC_ShareLocation -.->|<<extend>>| UC_RouteDeviationAlert
    UC_ActivateProtecting -.->|<<include>>| UC_StreamCCTV
    UC_CompleteRide -.->|<<include>>| UC_SelectPayment
    UC_SelectPayment -.->|<<include>>| UC_PayCash
    UC_SelectPayment -.->|<<include>>| UC_PayCashless
    UC_PayCashless -.->|<<include>>| UC_VerifyPayment
    UC_CompleteRide -.->|<<include>>| UC_DeactivateSafety
    UC_DriverSalesSummary -.->|<<extend>>| UC_DriverPayout

    %% Styling (Clean Black & White / Monochrome UML Standard)
    classDef actorStyle fill:#ffffff,stroke:#000000,stroke-width:2px,color:#000000,font-weight:bold;
    classDef usecaseStyle fill:#ffffff,stroke:#000000,stroke-width:1.5px,color:#000000;
    classDef boundaryStyle fill:#fafafa,stroke:#333333,stroke-width:1.5px,stroke-dasharray: 4 4,color:#000000,font-weight:bold;

    class Passenger,Driver,Guardian,PaymentGW,CloudStorage,MapService actorStyle;
    class UC_Register,UC_ManageProfile,UC_ManageFavorites,UC_ManageFamily,UC_DriverAuth,UC_DriverStatus,UC_SelectPickup,UC_SelectDest,UC_AddStops,UC_EstimateFare,UC_CallTaxi,UC_Dispatch,UC_AcceptReject,UC_ReassignDriver,UC_LiveTrackingPickup,UC_Chat,UC_StartRide,UC_ActivateGuardian,UC_ShareLocation,UC_RouteDeviationAlert,UC_ActivateProtecting,UC_StreamCCTV,UC_CompleteRide,UC_SelectPayment,UC_PayCash,UC_PayCashless,UC_VerifyPayment,UC_DeactivateSafety,UC_DriverSalesSummary,UC_DriverPayout usecaseStyle;
    class TaxiSystem,SubAuth,SubBooking,SubRideSafety,SubPayment boundaryStyle;
```

---

### 2.2 End-to-End System Process Flowchart

This flowchart illustrates the step-by-step business flow from onboarding and multi-stop booking to cascading dispatch, dual safety monitoring, and cashless wallet verification.

```mermaid
flowchart TD
    %% Global Styling Classes (Black & White UML Theme)
    classDef startEnd fill:#000000,stroke:#000000,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef process fill:#ffffff,stroke:#000000,stroke-width:1.5px,color:#000000;
    classDef decision fill:#ffffff,stroke:#000000,stroke-width:1.5px,color:#000000;
    classDef safety fill:#f5f5f5,stroke:#000000,stroke-width:2px,stroke-dasharray: 5 5,color:#000000,font-weight:bold;
    classDef external fill:#ffffff,stroke:#000000,stroke-width:2px,color:#000000;

    %% ------------------------------------------------------------------------
    %% SECTION 1: PASSENGER ONBOARDING & BOOKING
    %% ------------------------------------------------------------------------
    subgraph S1 ["1. Passenger Initialization & Booking Setup"]
        StartPassenger(["Passenger Opens App"]):::startEnd
        CheckFirstLogin{"First Time\nLogin?"}:::decision
        UserRegistration["User Registration\n(Phone, OTP, Name)"]:::process
        UserLP["User App Landing Page\n(Call Taxi, Guardian, Favorites, History, Profile)"]:::process

        SelectRidePoint["Choose Ride Pickup Point"]:::process
        RidePointSources{"Pickup Source"}:::decision
        RP_Current["Current GPS Location"]:::process
        RP_Fav["Favorite Location"]:::process
        RP_Map["Choose on Map (Pin)"]:::process
        RP_Search["Search Location Query"]:::process

        SelectDestPoint["Choose Destination Point"]:::process
        DestPointSources{"Destination Source"}:::decision
        DP_Current["Current Location"]:::process
        DP_Fav["Favorite Location"]:::process
        DP_Map["Choose on Map (Pin)"]:::process
        DP_Search["Search Location Query"]:::process

        CheckExtraStop{"Add Extra\nDestination Point?"}:::decision
        AddExtraStop["Select Extra Waypoint\n(Map / Favorite / Search)"]:::process

        CalcRouteFare["Compute Dynamic Route\n& Estimated Taxi Fare"]:::process
        DisplayRouteFare["Display Route Map\n& Estimated Taxi Fare"]:::process
        BtnCallNow(["User Taps 'Call Now'"]):::startEnd
    end

    StartPassenger --> CheckFirstLogin
    CheckFirstLogin -- "Yes" --> UserRegistration --> UserLP
    CheckFirstLogin -- "No" --> UserLP
    UserLP --> SelectRidePoint

    SelectRidePoint --> RidePointSources
    RidePointSources --> RP_Current --> SelectDestPoint
    RidePointSources --> RP_Fav --> SelectDestPoint
    RidePointSources --> RP_Map --> SelectDestPoint
    RidePointSources --> RP_Search --> SelectDestPoint

    SelectDestPoint --> DestPointSources
    DestPointSources --> DP_Current --> CheckExtraStop
    DestPointSources --> DP_Fav --> CheckExtraStop
    DestPointSources --> DP_Map --> CheckExtraStop
    DestPointSources --> DP_Search --> CheckExtraStop

    CheckExtraStop -- "Yes" --> AddExtraStop --> CheckExtraStop
    CheckExtraStop -- "No" --> CalcRouteFare --> DisplayRouteFare --> BtnCallNow

    %% ------------------------------------------------------------------------
    %% SECTION 2: DRIVER STATUS & INTELLIGENT DISPATCH
    %% ------------------------------------------------------------------------
    subgraph S2 ["2. Driver Lifecycle & Dispatch Engine"]
        DriverLogin["Driver App Login\n& Shift Verification"]:::process
        DriverStatus{"Driver Status"}:::decision
        DriverBreak["Break Time"]:::process
        DriverDuty["On Another Duty"]:::process
        DriverAvail["Available (Ready for Orders)"]:::process

        SearchDriver["Dispatch Engine: Search Nearest\nAvailable Drivers (Geohash/PostGIS)"]:::process
        NotifyDriver["Send Push & Sound Notification\nto Candidate Driver"]:::process
        DriverDecision{"Driver Accept\nor Reject?"}:::decision
        FindNextDriver["Cascade to Next Nearest\nAvailable Driver"]:::process
        NoDriverAlert["Notify Passenger:\nNo Drivers Found / Retry"]:::process

        DriverAccepted["Driver Accepts Ride Request"]:::process
        DisplayDriverInfo["Passenger App: Display Coming Taxi\n& Driver Profile (Plate, Photo, ETA)"]:::process
        TaxiEnRoute["Taxi Coming on Map (Live GPS)"]:::process
        ChatActive["In-App Chat System Activated\n(Direct Passenger <-> Driver Messaging)"]:::process
        DriverArrivedPickup["Driver Arrives at Pickup Point"]:::process
        ChatEnd["In-App Chat System Deactivated"]:::process
    end

    DriverLogin --> DriverStatus
    DriverStatus --> DriverBreak
    DriverStatus --> DriverDuty
    DriverStatus --> DriverAvail

    BtnCallNow --> SearchDriver
    DriverAvail --> SearchDriver
    SearchDriver --> NotifyDriver
    NotifyDriver --> DriverDecision
    DriverDecision -- "Reject / Timeout" --> FindNextDriver
    FindNextDriver --> DriverDecision
    FindNextDriver -- "Exhausted" --> NoDriverAlert

    DriverDecision -- "Accept" --> DriverAccepted
    DriverAccepted --> DisplayDriverInfo --> TaxiEnRoute
    TaxiEnRoute --> ChatActive --> DriverArrivedPickup --> ChatEnd

    %% ------------------------------------------------------------------------
    %% SECTION 3: RIDE EXECUTION & DUAL SAFETY SYSTEMS
    %% ------------------------------------------------------------------------
    subgraph S3 ["3. In-Transit Ride & Dual Safety Mechanisms"]
        StartRide(["Passenger Boards & Ride Starts"]):::startEnd

        %% Guardian Sub-Flow
        subgraph SubGuardian ["Guardian Safety Shield (Passenger Side)"]
            GuardianActive["Guardian Mode Activated"]:::safety
            NotifyGuardian["Send 'Ride Started' Push Notification\nto Registered Family Guardians"]:::safety
            ShareLiveLoc["Share Real-Time Live GPS Stream\n& Driver/Vehicle Info to Guardian App"]:::safety
            GuardianMonitor["Guardian Can Track Live Route & Telemetry"]:::safety
            CheckDeviation{"Taxi Out of\nDesignated Route?"}:::decision
            AlertGuardian["Trigger Instant Out-of-Route Alert\n& Push Notification to Guardian"]:::safety
        end

        %% Driver Protecting Mode
        subgraph SubProtecting ["Driver In-Car Protecting Shield"]
            ProtectActive["Driver Protecting Mode Activated"]:::safety
            StartCCTV["Start Recording In-Car CCTV Video"]:::safety
            StartGPSLog["Start High-Frequency GPS Logging"]:::safety
            StreamCloud["Stream / Buffer Encrypted Telemetry\n& Footage to Cloud Storage"]:::safety
            StartMeter["Start Digital Meter & Turn-by-Turn Navigation"]:::process
        end

        ArriveDestination(["Taxi Arrives at Final Destination"]):::startEnd
        DisplayFinalFare["Display Final Calculated Fare\non Passenger & Driver Screens"]:::process
    end

    ChatEnd --> StartRide
    DriverArrivedPickup --> StartRide

    StartRide --> GuardianActive
    GuardianActive --> NotifyGuardian --> ShareLiveLoc --> GuardianMonitor
    ShareLiveLoc --> CheckDeviation
    CheckDeviation -- "Yes" --> AlertGuardian
    CheckDeviation -- "No" --> ArriveDestination

    StartRide --> ProtectActive
    ProtectActive --> StartCCTV & StartGPSLog
    StartCCTV --> StreamCloud
    StartGPSLog --> StreamCloud
    ProtectActive --> StartMeter --> ArriveDestination

    ArriveDestination --> DisplayFinalFare

    %% ------------------------------------------------------------------------
    %% SECTION 4: PAYMENT PROCESSING & SETTLEMENT
    %% ------------------------------------------------------------------------
    subgraph S4 ["4. Payment Processing, Safety Teardown & Driver Sales"]
        PaymentChoice{"Passenger Chooses\nPayment Method"}:::decision

        %% Cash Sub-flow
        PayCash["Passenger Hands Cash to Driver"]:::process
        DriverConfirmCash["Driver Confirms Cash Received"]:::process

        %% Cashless Sub-flow
        PayCashless["Passenger Selects E-Wallet\n(KBZPay, AYAPay, WavePay)"]:::process
        JumpWallet["Native Deep-Link Jump to\nPayment Application"]:::process
        MakePayment["User Authenticates & Completes Payment"]:::external
        JumpBack["Native Deep-Link Jump Back\nto Taxi Application"]:::process
        VerifyPayment["Backend Payment Verification\n(Webhook & API Query)"]:::process
        PaymentSuccess["Payment Confirmed & Receipt Generated"]:::process

        ThankYou["Display 'Thank You' Screen\n(Rating & Digital Receipt)"]:::process

        %% Deactivation & Settlement
        StopCCTV["Stop In-Car CCTV Recording\n& Finalize Secure Cloud Upload"]:::safety
        StopGPSLog["Stop High-Frequency GPS Logging"]:::safety
        DeactivateProtect["Protecting Mode Deactivated"]:::safety

        NotifyGuardianArrived["Send 'Safely Arrived' Push Notification\nto Guardian"]:::safety
        StopLocShare["Stop Guardian Live Location Sharing"]:::safety
        DeactivateGuardian["Guardian Mode Deactivated"]:::safety

        DriverWallet["Credit Driver Balance\n(After Platform Fee Deduction)"]:::process
        DriverSalesView["Driver Views Daily Sales Summary\n& Today's Orders"]:::process
        TransferSales["Driver Initiates 'Transfer Sales'\n(Payout to Bank / E-Wallet)"]:::process
        DriverReady(["Driver Status: Available for Next Ride"]):::startEnd
    end

    DisplayFinalFare --> PaymentChoice

    PaymentChoice -- "Cash" --> PayCash --> DriverConfirmCash --> ThankYou
    PaymentChoice -- "Cashless" --> PayCashless --> JumpWallet --> MakePayment --> JumpBack --> VerifyPayment --> PaymentSuccess --> ThankYou

    ThankYou --> StopCCTV & StopGPSLog --> DeactivateProtect
    ThankYou --> NotifyGuardianArrived --> StopLocShare --> DeactivateGuardian

    DeactivateProtect --> DriverWallet --> DriverSalesView --> TransferSales --> DriverReady
    DeactivateGuardian --> DriverReady
```

---

### 2.3 Data Flow Diagram (DFD - Level 1)

The Data Flow Diagram illustrates how information moves across system boundaries, backend processes, and relational/in-memory data stores.

```mermaid
flowchart LR
    %% Global Styling Classes (Black & White UML DFD)
    classDef entity fill:#ffffff,stroke:#000000,stroke-width:2px,color:#000000,font-weight:bold;
    classDef process fill:#ffffff,stroke:#000000,stroke-width:2px,color:#000000;
    classDef datastore fill:#ffffff,stroke:#000000,stroke-width:2px,stroke-dasharray: 4 2,color:#000000;

    %% External Entities
    subgraph ExternalEntities ["External Entities (Sources / Sinks)"]
        E_Passenger["Passenger Mobile App\n(Native iOS/Android)"]:::entity
        E_Driver["Driver Mobile App\n(Native iOS/Android)"]:::entity
        E_Guardian["Guardian Mobile App\n(Native iOS/Android)"]:::entity
        E_PaymentGW["Payment Gateway\n(KBZPay / AYAPay / Wave)"]:::entity
        E_MapService["Routing / Map Service\n(OSRM / Mapbox)"]:::entity
        E_CloudMedia["Cloud Object Storage\n(S3 / Secure Video Vault)"]:::entity
    end

    %% Processes
    subgraph Processes ["Core Backend Processes (Golang Engine)"]
        P1["1.0 Auth & Profile\nManagement"]:::process
        P2["2.0 Geocoding &\nRoute Calculation"]:::process
        P3["3.0 Dispatch &\nMatching Engine"]:::process
        P4["4.0 Real-time Tracking\n& Chat Service"]:::process
        P5["5.0 Guardian & Safety\nDeviation Engine"]:::process
        P6["6.0 CCTV Stream &\nGPS Ingestion"]:::process
        P7["7.0 Fare Metering &\nPayment Processing"]:::process
        P8["8.0 Driver Wallet &\nSales Settlement"]:::process
    end

    %% Data Stores
    subgraph DataStores ["Data Stores (PostgreSQL / Redis / Object Storage)"]
        DS_Users[("D1: Users, Family &\nFavorites Store")]:::datastore
        DS_Drivers[("D2: Drivers, Vehicles &\nStatus Store")]:::datastore
        DS_Rides[("D3: Ride Orders &\nWaypoints Store")]:::datastore
        DS_RedisGeo[("D4: Redis Live Geolocation\n& Pub/Sub Queue")]:::datastore
        DS_Chat[("D5: Chat Messages Store")]:::datastore
        DS_GPSLogs[("D6: GPS Telemetry Logs")]:::datastore
        DS_Finance[("D7: Transactions &\nDriver Wallet Ledger")]:::datastore
    end

    %% Data Flows
    E_Passenger -->|"Registration, Profile, Family Members"| P1
    E_Driver -->|"Driver Credentials, Vehicle Info"| P1
    P1 -->|"Persist User / Guardian / Driver Data"| DS_Users
    P1 -->|"Persist Driver & Vehicle Verification"| DS_Drivers
    DS_Users -->|"User Profile & Favorites"| P1
    P1 -->|"Auth Token & Profile Info"| E_Passenger
    P1 -->|"Auth Token & Driver Profile"| E_Driver

    E_Passenger -->|"Pickup, Multi-Destination Coordinates"| P2
    P2 -->|"Request Waypoint Distances & Polyline"| E_MapService
    E_MapService -->|"Route Geometry, Distance, ETA"| P2
    P2 -->|"Estimated Fare & Route Preview"| E_Passenger

    E_Passenger -->|"Ride Booking Request (Call Now)"| P3
    E_Driver -->|"Driver Status (Available / Break / Duty)"| P3
    P3 -->|"Update Driver Status & Active Location"| DS_Drivers
    P3 -->|"Query Nearest Available Drivers"| DS_RedisGeo
    P3 -->|"Create Pending Ride Order"| DS_Rides
    P3 -->|"Push Dispatch Request (Route & Fare)"| E_Driver
    E_Driver -->|"Accept / Reject Decision"| P3
    P3 -->|"Driver Accepted Notification & Driver Profile"| E_Passenger

    E_Driver -->|"Periodic Driver GPS Coordinates (WebSocket)"| P4
    P4 -->|"Update Live Geo Index"| DS_RedisGeo
    DS_RedisGeo -->|"Live Driver Coordinate Stream"| P4
    P4 -->|"Live Taxi Approaching Stream"| E_Passenger
    E_Passenger <-->|"Chat Messages (WebSocket)"| P4
    E_Driver <-->|"Chat Messages (WebSocket)"| P4
    P4 -->|"Store Chat Audit Trail"| DS_Chat

    P4 -->|"Ride Started Event"| P5
    P5 -->|"Fetch Registered Family Guardians"| DS_Users
    P5 -->|"Ride Started Push Notification & Telemetry"| E_Guardian
    P4 -->|"Live In-Transit GPS Telemetry"| P5
    P5 -->|"Check GPS vs Planned Route Polyline"| E_MapService
    P5 -->|"Route Deviation Alert Notification"| E_Guardian

    E_Driver -->|"High-Frequency GPS Stream"| P6
    E_Driver -->|"In-Car CCTV Encrypted Stream / Chunks"| P6
    P6 -->|"Append GPS Track Points"| DS_GPSLogs
    P6 -->|"Upload Encrypted Video Records"| E_CloudMedia

    E_Driver -->|"Trip Arrival & Meter Telemetry"| P7
    P7 -->|"Compute Final Fare (Distance + Time)"| DS_Rides
    P7 -->|"Final Fare Amount"| E_Passenger
    P7 -->|"Final Fare Amount"| E_Driver

    E_Driver -->|"Cash Payment Confirmation"| P7

    E_Passenger -->|"Initiate E-Wallet Payment Request"| P7
    P7 -->|"Generate Order Deep-Link & Payment Payload"| E_Passenger
    E_Passenger -->|"Execute Payment inside E-Wallet App"| E_PaymentGW
    E_PaymentGW -->|"Webhook Payment Callback / Signature"| P7
    P7 -->|"Verify Transaction Signature & Status"| E_PaymentGW
    P7 -->|"Record Payment Transaction"| DS_Finance
    P7 -->|"Payment Completed Event & Receipt"| E_Passenger
    P7 -->|"Payment Received Notification"| E_Driver
    P7 -->|"Trip Completed Notification"| E_Guardian

    P7 -->|"Credit Net Earnings to Driver Account"| P8
    P8 -->|"Update Driver Balance & Ledger Entries"| DS_Finance
    E_Driver -->|"Query Daily Sales Summary & Order History"| P8
    DS_Finance -->|"Sales Summary Data"| P8
    P8 -->|"Daily Sales Summary Response"| E_Driver
    E_Driver -->|"Initiate Sales Transfer (Payout Request)"| P8
    P8 -->|"Process Payout Transfer via Bank/Wallet API"| E_PaymentGW
    E_PaymentGW -->|"Payout Confirmation"| P8
    P8 -->|"Update Wallet Payout Status"| DS_Finance
    P8 -->|"Payout Success Confirmation"| E_Driver
```

---

### 2.4 Entity-Relationship Diagram (ERD - Database Layout)

The relational schema implements complete referential integrity, geospatial indexing, financial double-entry tracking, and audit logging.

```mermaid
erDiagram
    %% ------------------------------------------------------------------------
    %% USER & GUARDIAN DOMAIN
    %% ------------------------------------------------------------------------
    USERS {
        uuid id PK
        string phone_number UK
        string full_name
        string email UK
        string role "passenger | driver | admin"
        string avatar_url
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    FAVORITE_LOCATIONS {
        uuid id PK
        uuid user_id FK
        string label "Home | Work | Gym | Custom"
        string address_text
        decimal latitude
        decimal longitude
        timestamp created_at
    }

    GUARDIAN_RELATIONSHIPS {
        uuid id PK
        uuid passenger_id FK "User who rides"
        uuid guardian_id FK "User who receives alerts"
        string relationship_type "Parent | Spouse | Sibling | Friend"
        boolean is_active
        boolean notify_ride_start
        boolean notify_deviation
        timestamp created_at
    }

    %% ------------------------------------------------------------------------
    %% DRIVER & VEHICLE DOMAIN
    %% ------------------------------------------------------------------------
    DRIVERS {
        uuid id PK
        uuid user_id FK
        string license_number UK
        string national_id UK
        string status "AVAILABLE | BREAK | ON_DUTY | BUSY | OFFLINE"
        decimal current_lat
        decimal current_lng
        decimal rating_avg
        integer total_trips
        boolean is_verified
        timestamp last_status_update
        timestamp created_at
    }

    VEHICLES {
        uuid id PK
        uuid driver_id FK
        string make
        string model
        string license_plate UK
        string color
        integer manufacture_year
        string cctv_device_serial
        boolean is_active
        timestamp created_at
    }

    DRIVER_STATUS_LOGS {
        uuid id PK
        uuid driver_id FK
        string previous_status
        string new_status
        decimal latitude
        decimal longitude
        timestamp changed_at
    }

    %% ------------------------------------------------------------------------
    %% RIDE & DISPATCH DOMAIN
    %% ------------------------------------------------------------------------
    RIDES {
        uuid id PK
        uuid passenger_id FK
        uuid driver_id FK "Nullable until assigned"
        uuid vehicle_id FK "Nullable until assigned"
        string status "SEARCHING | DISPATCHED | ACCEPTED | ARRIVING | IN_TRANSIT | ARRIVED | COMPLETED | CANCELLED"
        string pickup_address
        decimal pickup_lat
        decimal pickup_lng
        string final_dest_address
        decimal final_dest_lat
        decimal final_dest_lng
        decimal estimated_distance_km
        integer estimated_duration_min
        decimal estimated_fare
        decimal actual_distance_km
        integer actual_duration_min
        decimal actual_fare
        string payment_method "CASH | CASHLESS"
        string payment_status "PENDING | SUCCESS | FAILED"
        timestamp requested_at
        timestamp accepted_at
        timestamp pickup_arrived_at
        timestamp ride_started_at
        timestamp ride_completed_at
        timestamp cancelled_at
    }

    RIDE_WAYPOINTS {
        uuid id PK
        uuid ride_id FK
        integer stop_order "1, 2, 3..."
        string address_text
        decimal latitude
        decimal longitude
        boolean is_visited
        timestamp visited_at
    }

    RIDE_DISPATCHES {
        uuid id PK
        uuid ride_id FK
        uuid driver_id FK
        string dispatch_status "PENDING | ACCEPTED | REJECTED | TIMEOUT"
        decimal driver_distance_km
        timestamp offered_at
        timestamp responded_at
        timestamp timeout_at
    }

    %% ------------------------------------------------------------------------
    %% COMMUNICATION & SAFETY DOMAIN
    %% ------------------------------------------------------------------------
    CHAT_MESSAGES {
        uuid id PK
        uuid ride_id FK
        uuid sender_id FK
        uuid recipient_id FK
        string message_type "TEXT | IMAGE | SYSTEM"
        string content
        boolean is_read
        timestamp sent_at
        timestamp read_at
    }

    GPS_TELEMETRY_LOGS {
        uuid id PK
        uuid ride_id FK
        uuid driver_id FK
        decimal latitude
        decimal longitude
        decimal speed_kmh
        decimal heading_deg
        decimal accuracy_meters
        timestamp recorded_at
    }

    CCTV_RECORDINGS {
        uuid id PK
        uuid ride_id FK
        uuid vehicle_id FK
        string storage_file_key
        string cloud_storage_url
        bigint file_size_bytes
        integer duration_seconds
        string hash_sha256
        string encryption_algorithm
        string status "RECORDING | UPLOADING | ARCHIVED"
        timestamp recorded_from
        timestamp recorded_to
    }

    SAFETY_ALERTS {
        uuid id PK
        uuid ride_id FK
        uuid triggered_by FK
        string alert_type "OUT_OF_ROUTE | PANIC_BUTTON | PROLONGED_STOP"
        decimal deviation_distance_meters
        decimal current_lat
        decimal current_lng
        string status "TRIGGERED | ACKNOWLEDGED | RESOLVED"
        timestamp created_at
        timestamp resolved_at
    }

    %% ------------------------------------------------------------------------
    %% PAYMENT & FINANCIAL SETTLEMENT DOMAIN
    %% ------------------------------------------------------------------------
    PAYMENTS {
        uuid id PK
        uuid ride_id FK
        uuid passenger_id FK
        decimal amount
        string currency "MMK | USD"
        string payment_method "CASH | CASHLESS"
        string gateway_provider "KBZPAY | AYAPAY | WAVEPAY | CASH"
        string transaction_ref UK
        string payment_payload_json
        string status "INITIATED | AUTHORIZED | SETTLED | FAILED"
        timestamp verified_at
        timestamp created_at
    }

    DRIVER_WALLETS {
        uuid id PK
        uuid driver_id FK UK
        decimal total_earned
        decimal available_balance
        decimal pending_balance
        string currency "MMK | USD"
        timestamp updated_at
    }

    DRIVER_PAYOUTS {
        uuid id PK
        uuid wallet_id FK
        uuid driver_id FK
        decimal amount
        string payout_channel "KBZPAY | AYAPAY | BANK_TRANSFER"
        string account_number
        string transaction_ref UK
        string status "PENDING | PROCESSING | COMPLETED | REJECTED"
        timestamp requested_at
        timestamp processed_at
    }

    %% Relationships
    USERS ||--o{ FAVORITE_LOCATIONS : "defines"
    USERS ||--o{ GUARDIAN_RELATIONSHIPS : "has family guardians"
    USERS ||--o{ GUARDIAN_RELATIONSHIPS : "acts as guardian for"
    USERS ||--o| DRIVERS : "registers as"
    USERS ||--o{ RIDES : "requests"
    USERS ||--o{ CHAT_MESSAGES : "sends"
    USERS ||--o{ PAYMENTS : "pays"

    DRIVERS ||--o{ VEHICLES : "operates"
    DRIVERS ||--o{ DRIVER_STATUS_LOGS : "logs status transitions"
    DRIVERS ||--o{ RIDES : "executes"
    DRIVERS ||--o{ RIDE_DISPATCHES : "receives offers"
    DRIVERS ||--o| DRIVER_WALLETS : "owns"
    DRIVERS ||--o{ DRIVER_PAYOUTS : "requests"
    DRIVERS ||--o{ GPS_TELEMETRY_LOGS : "streams telemetry"

    RIDES ||--o{ RIDE_WAYPOINTS : "contains ordered"
    RIDES ||--o{ RIDE_DISPATCHES : "generates dispatch rounds"
    RIDES ||--o{ CHAT_MESSAGES : "contextualizes"
    RIDES ||--o{ GPS_TELEMETRY_LOGS : "tracks route points"
    RIDES ||--o{ CCTV_RECORDINGS : "secures with"
    RIDES ||--o{ SAFETY_ALERTS : "monitors for"
    RIDES ||--|| PAYMENTS : "settles with"

    VEHICLES ||--o{ RIDES : "assigned to"
    VEHICLES ||--o{ CCTV_RECORDINGS : "captures"

    DRIVER_WALLETS ||--o{ DRIVER_PAYOUTS : "disburses funds via"
```

---

### 2.5 Class & Domain Architecture Diagram (Go & Native Mobile)

This diagram details the clean architecture mapping across Domain Entities, Golang Use Cases, Repositories, and Native Mobile ViewModels.

```mermaid
classDiagram
    %% Domain Entities
    class User {
        +UUID ID
        +string PhoneNumber
        +string FullName
        +string Role
        +bool IsActive
        +time.Time CreatedAt
        +GetGuardians() List~User~
        +AddFavorite(FavoriteLocation) error
    }

    class Driver {
        +UUID ID
        +UUID UserID
        +string LicenseNumber
        +DriverStatus Status
        +GeoPoint CurrentLocation
        +float64 Rating
        +bool IsAvailable() bool
        +UpdateStatus(DriverStatus) error
    }

    class Vehicle {
        +UUID ID
        +UUID DriverID
        +string Make
        +string Model
        +string LicensePlate
        +string CCTVDeviceID
    }

    class Ride {
        +UUID ID
        +UUID PassengerID
        +UUID DriverID
        +RideStatus Status
        +GeoPoint PickupLocation
        +GeoPoint DestinationLocation
        +List~Waypoint~ Waypoints
        +FareEstimate EstimatedFare
        +FareActual ActualFare
        +PaymentMethod Method
        +PaymentStatus PaymentStatus
        +CalculateFare(km, min) Money
        +AddWaypoint(GeoPoint) error
        +StartTrip() error
        +CompleteTrip() error
    }

    class Waypoint {
        +UUID ID
        +UUID RideID
        +int OrderIndex
        +string Address
        +GeoPoint Location
        +bool IsVisited
    }

    class ChatMessage {
        +UUID ID
        +UUID RideID
        +UUID SenderID
        +UUID RecipientID
        +string Content
        +time.Time SentAt
    }

    class SafetySession {
        +UUID ID
        +UUID RideID
        +bool GuardianModeActive
        +bool ProtectingModeActive
        +GeoPolyline PlannedRoute
        +StartCCTVLogging() error
        +CheckDeviation(GeoPoint) bool
        +TriggerAlert(AlertType) error
    }

    class PaymentTransaction {
        +UUID ID
        +UUID RideID
        +UUID PayerID
        +Money Amount
        +PaymentProvider Provider
        +TransactionStatus Status
        +string TransactionRef
        +VerifySignature() bool
    }

    class DriverWallet {
        +UUID ID
        +UUID DriverID
        +Money Balance
        +Money PendingBalance
        +Credit(Money) error
        +RequestPayout(Money, PayoutChannel) PayoutRequest
    }

    %% Service Interfaces
    class RideUseCase {
        <<interface>>
        +EstimateRide(ctx, req EstimateRequest) (EstimateResponse, error)
        +RequestRide(ctx, req BookingRequest) (Ride, error)
        +DispatchNextDriver(ctx, rideID UUID) (Driver, error)
        +AcceptRide(ctx, rideID, driverID UUID) error
        +RejectRide(ctx, rideID, driverID UUID) error
        +StartRide(ctx, rideID UUID) error
        +CompleteRide(ctx, rideID UUID) (FareSummary, error)
    }

    class SafetyUseCase {
        <<interface>>
        +ActivateGuardianMode(ctx, rideID UUID) error
        +BroadcastGPS(ctx, rideID UUID, pt GeoPoint) error
        +EvaluateRouteDeviation(ctx, rideID UUID, pt GeoPoint) (bool, error)
        +StartProtectingMode(ctx, rideID, vehicleID UUID) error
        +UploadCCTVChunk(ctx, rideID UUID, chunk io.Reader) error
        +DeactivateSafety(ctx, rideID UUID) error
    }

    class PaymentUseCase {
        <<interface>>
        +InitiateCashlessPayment(ctx, rideID UUID, provider PaymentProvider) (DeepLinkResult, error)
        +HandlePaymentWebhook(ctx, payload WebhookData) error
        +ConfirmCashPayment(ctx, rideID, driverID UUID) error
        +GetDailySalesSummary(ctx, driverID UUID, date time.Time) (SalesSummary, error)
        +DisburseDriverPayout(ctx, driverID UUID, amount Money) (PayoutResult, error)
    }

    class ChatUseCase {
        <<interface>>
        +SendMessage(ctx, msg ChatMessage) error
        +GetRideChatHistory(ctx, rideID UUID) (List~ChatMessage~, error)
        +CloseChatSession(ctx, rideID UUID) error
    }

    %% Repository Interfaces
    class RideRepository {
        <<interface>>
        +Create(ctx, ride Ride) error
        +FindByID(ctx, id UUID) (Ride, error)
        +UpdateStatus(ctx, id UUID, status RideStatus) error
        +FindNearbyAvailableDrivers(ctx, pt GeoPoint, radiusKm float64) (List~Driver~, error)
    }

    class DriverWalletRepository {
        <<interface>>
        +GetByDriverID(ctx, driverID UUID) (DriverWallet, error)
        +UpdateBalanceAtomic(ctx, driverID UUID, amount Money) error
        +CreatePayout(ctx, payout PayoutRequest) error
    }

    %% Native Mobile ViewModels
    class PassengerViewModel {
        +RideState CurrentRideState
        +LocationData CurrentLocation
        +FareEstimate EstimatedFare
        +SelectPickup(GeoPoint)
        +AddDestinationWaypoint(GeoPoint)
        +CallTaxi()
        +SelectPaymentMethod(Method)
    }

    class DriverViewModel {
        +DriverStatus CurrentStatus
        +DispatchOffer PendingOffer
        +SalesSummary TodaySales
        +ToggleStatus(DriverStatus)
        +AcceptBooking(rideID)
        +StartMeterNavigation()
        +ConfirmCashReceived()
        +TransferSales()
    }

    class GuardianViewModel {
        +List~FamilyMember~ TrackedMembers
        +GeoPoint LiveDriverLocation
        +Polyline PlannedRoute
        +bool DeviationAlertActive
        +SubscribeToLiveStream(rideID)
        +DismissAlert()
    }

    class NativeCCTVManager {
        +CameraCaptureSession CaptureSession
        +GPSLogger HighFrequencyLogger
        +StartRecording()
        +StreamEncryptedChunks()
        +StopRecording()
    }

    %% Relationships
    User "1" -- "0..*" Waypoint : creates
    User "1" -- "0..1" Driver : profile
    Driver "1" -- "1" Vehicle : operates
    Driver "1" -- "1" DriverWallet : manages

    Ride "1" *-- "1..*" Waypoint : contains
    Ride "1" -- "1" User : booked_by
    Ride "1" -- "0..1" Driver : assigned_to
    Ride "1" -- "1" SafetySession : monitors
    Ride "1" -- "0..*" ChatMessage : contains
    Ride "1" -- "1" PaymentTransaction : settles_with

    RideUseCase ..|> Ride : orchestrates
    SafetyUseCase ..|> SafetySession : manages
    PaymentUseCase ..|> PaymentTransaction : verifies
    PaymentUseCase ..|> DriverWallet : credits
    ChatUseCase ..|> ChatMessage : routes

    RideUseCase --> RideRepository : uses
    PaymentUseCase --> DriverWalletRepository : uses

    PassengerViewModel ..> RideUseCase : calls API/WS
    DriverViewModel ..> RideUseCase : calls API/WS
    DriverViewModel ..> PaymentUseCase : initiates payout
    DriverViewModel ..> NativeCCTVManager : controls
    GuardianViewModel ..> SafetyUseCase : subscribes WS
```

---

### 2.6 Sequence Diagrams

#### 2.6.1 Ride Booking, Multi-Stop Fare Estimation, Driver Dispatch & In-App Chat

```mermaid
sequenceDiagram
    autonumber
    actor Passenger as fa:fa-user Passenger (Native App)
    participant Gateway as fa:fa-server Go API Gateway
    participant RouteSvc as fa:fa-route Go Routing Service
    participant DispatchSvc as fa:fa-brain Go Dispatch Service
    participant RedisDB as fa:fa-database Redis (Geo & Cache)
    participant ChatSvc as fa:fa-comments Go WebSocket Chat
    actor Driver1 as fa:fa-id-card Driver 1 (Nearby)
    actor Driver2 as fa:fa-id-card Driver 2 (Next Nearest)

    %% Route & Fare
    rect rgb(250, 250, 250)
        Note over Passenger, RouteSvc: Phase 1: Route & Multi-Stop Fare Estimation
        Passenger->>Gateway: POST /api/v1/rides/estimate (Pickup, Dest, [Extra Waypoints])
        Gateway->>RouteSvc: ComputeRouteAndFare(points)
        RouteSvc-->>Gateway: RouteGeometry, TotalDistanceKm, DurationMin, EstimatedFare
        Gateway-->>Passenger: 200 OK (Estimated Fare & Polyline Map)
    end

    %% Call Taxi & Dispatch
    rect rgb(255, 255, 255)
        Note over Passenger, Driver2: Phase 2: Call Taxi & Cascading Dispatch
        Passenger->>Gateway: POST /api/v1/rides/request (RideDetails)
        Gateway->>DispatchSvc: CreateRideOrder(RideRequest)
        DispatchSvc->>RedisDB: Query GEORADIUS(pickup_lat, pickup_lng, radius=3km, status=AVAILABLE)
        RedisDB-->>DispatchSvc: Ranked Drivers: [Driver1, Driver2, ...]

        %% Dispatch to Driver 1
        DispatchSvc-)Driver1: Push Notification: New Ride Request (Pickup, Route, Fare)
        Note over Driver1: 15s Countdown Timer
        Driver1-->>DispatchSvc: Action: REJECT (or Timeout)

        %% Cascade to Driver 2
        DispatchSvc->>DispatchSvc: Cascade to Next Ranked Driver
        DispatchSvc-)Driver2: Push Notification: New Ride Request (Pickup, Route, Fare)
        Driver2->>Gateway: POST /api/v1/rides/{id}/accept
        Gateway->>DispatchSvc: ConfirmAssignment(rideID, driver2_id)
        DispatchSvc->>RedisDB: Update Driver2 Status = 'HEADING_TO_PICKUP'
        DispatchSvc-->>Driver2: 200 OK (Passenger Details, Navigation Start)
    end

    %% Tracking & Chat
    rect rgb(250, 250, 250)
        Note over Passenger, Driver2: Phase 3: Live Tracking & In-App Chat En Route
        DispatchSvc-)Passenger: Push/WS: Driver Assigned (Driver Profile, Vehicle Plate, Live GPS, ETA)
        DispatchSvc->>ChatSvc: OpenChatRoom(rideID, passengerID, driver2ID)

        par Live GPS Streaming
            loop Every 2 Seconds
                Driver2->>Gateway: WS/gRPC Stream GPS (lat, lng, heading)
                Gateway->>RedisDB: GEOADD driver_live_locations
                Gateway-)Passenger: WS: Driver Coming on Map (Live Marker Animation)
            end
        and Real-time Chatting
            Passenger->>ChatSvc: SendMessage("I am waiting near the main gate.")
            ChatSvc-)Driver2: DeliverMessage("I am waiting near the main gate.")
            Driver2->>ChatSvc: SendMessage("Got it! Arriving in 2 minutes.")
            ChatSvc-)Passenger: DeliverMessage("Got it! Arriving in 2 minutes.")
        end
    end

    %% Arrival
    rect rgb(255, 255, 255)
        Note over Passenger, Driver2: Phase 4: Driver Arrival at Pickup
        Driver2->>Gateway: POST /api/v1/rides/{id}/arrived-pickup
        Gateway-)Passenger: Push/Sound: "Your Taxi Has Arrived!"
        Gateway->>ChatSvc: CloseChatRoom(rideID)
        ChatSvc-->>Passenger: Chat Session Closed
        ChatSvc-->>Driver2: Chat Session Closed
    end
```

---

#### 2.6.2 In-Transit Guardian Shield & CCTV Protecting Mode

```mermaid
sequenceDiagram
    autonumber
    actor Driver as fa:fa-id-card Driver (Native App)
    actor Passenger as fa:fa-user Passenger (Native App)
    participant Gateway as fa:fa-server Go API Gateway
    participant SafetySvc as fa:fa-shield-alt Go Safety & Telemetry Engine
    participant DevEngine as fa:fa-compass Geofence & Deviation Checker
    participant CloudMedia as fa:fa-cloud Cloud CCTV Storage (S3)
    actor Guardian as fa:fa-user-shield Guardian (Family App)

    rect rgb(250, 250, 250)
        Note over Driver, Guardian: Phase 1: Ride Start & Safety Subsystem Activation
        Driver->>Gateway: POST /api/v1/rides/{id}/start-ride
        Gateway->>SafetySvc: ActivateRideSafety(rideID, driverID, passengerID)

        par Guardian Shield Activation
            SafetySvc->>Guardian: Push Notification: "Family member started taxi ride in Car [Plate No]"
            SafetySvc-)Guardian: Send Driver Profile, Vehicle Details & Planned Polyline
            Guardian->>SafetySvc: WS Connect: SubscribeToRideTelemetry(rideID)
        and Driver In-Car Protecting Mode Activation
            SafetySvc-->>Driver: 200 OK (Protecting Mode ACTIVATED)
            Driver->>Driver: Start In-Car CCTV Video Recording (Encrypted Buffer)
            Driver->>Driver: Start High-Precision GPS Logger (10Hz)
            Driver->>Driver: Turn-by-Turn Navigation & Digital Meter Start
        end
    end

    rect rgb(255, 255, 255)
        Note over Driver, Guardian: Phase 2: Real-time Telemetry & Anomaly Detection
        loop In-Transit GPS Streaming & Verification
            Driver->>SafetySvc: WS: StreamTelemetry(lat, lng, speed, heading, timestamp)
            SafetySvc-)Guardian: WS: StreamLiveLocation(lat, lng, speed)
            SafetySvc->>DevEngine: CheckDeviation(currentPoint, plannedRoutePolyline)

            alt Route Normal (Within Buffer Threshold < 200m)
                DevEngine-->>SafetySvc: Status: ON_ROUTE
            else Deviation Detected (Off-Route > 300m for > 45s)
                DevEngine-->>SafetySvc: Trigger: OUT_OF_ROUTE_EVENT
                SafetySvc-)Guardian: CRITICAL ALERT: "Taxi Deviated from Scheduled Route!"
                SafetySvc-)Passenger: In-App Warning: "Route deviation detected. Are you safe?"
                Guardian->>Guardian: Display Interactive Live Detour Map & Quick Call
            end
        end

        par Background CCTV Cloud Vault Sync
            loop Every 60 Seconds or on Significant Event
                Driver->>Gateway: POST /api/v1/safety/cctv-chunks (Encrypted Video Segment)
                Gateway->>CloudMedia: StoreEncryptedObject(chunkID, rideID, sha256)
                CloudMedia-->>Driver: Chunk Ack (Recorded & Safely Logged)
            end
        end
    end

    rect rgb(250, 250, 250)
        Note over Driver, Guardian: Phase 3: Destination Arrival & Final Fare Calculation
        Driver->>Gateway: POST /api/v1/rides/{id}/arrive-destination
        Gateway->>SafetySvc: MarkDestinationArrived(rideID)
        SafetySvc-->>Passenger: Display Final Calculated Taxi Fare
        SafetySvc-->>Driver: Display Final Calculated Taxi Fare
    end
```

---

#### 2.6.3 Payment Processing, Deep-Linking, Safety Teardown & Driver Sales Payout

```mermaid
sequenceDiagram
    autonumber
    actor Passenger as fa:fa-user Passenger (Native App)
    actor Driver as fa:fa-id-card Driver (Native App)
    participant Gateway as fa:fa-server Go API Gateway
    participant PaymentSvc as fa:fa-money-bill-wave Go Payment Service
    participant SafetySvc as fa:fa-shield-alt Go Safety Service
    participant WalletApp as fa:fa-wallet E-Wallet App (KPay/AYAPay)
    participant PaymentGW as fa:fa-university Gateway Server
    actor Guardian as fa:fa-user-shield Guardian (Family App)

    rect rgb(255, 255, 255)
        Note over Passenger, PaymentGW: Phase 1: Payment Method Execution (Cash vs Cashless)
        alt Cash Payment Method Selected
            Passenger->>Driver: Hand physical cash
            Driver->>Gateway: POST /api/v1/payments/cash-confirm (rideID, amount)
            Gateway->>PaymentSvc: RecordCashSettlement(rideID)
            PaymentSvc-->>Driver: Cash Payment Confirmed
            PaymentSvc--)Passenger: WS: Payment Received Receipt
        else Cashless Payment Method Selected (E-Wallet Deep-Link)
            Passenger->>Gateway: POST /api/v1/payments/initiate-cashless (rideID, provider="KBZPAY")
            Gateway->>PaymentSvc: CreatePaymentSession(rideID, "KBZPAY")
            PaymentSvc->>PaymentGW: CreatePreOrder(amount, orderID)
            PaymentGW-->>PaymentSvc: PreOrderResponse (PaymentPayload, DeepLinkURI)
            PaymentSvc-->>Passenger: 200 OK (DeepLinkURI: 'kbzpay://pay?order=...')

            Passenger->>WalletApp: OS Deep-Link Jump to E-Wallet App
            Note over Passenger, WalletApp: User Authenticates (PIN / Biometrics) & Confirms Payment
            WalletApp->>PaymentGW: ProcessTransaction()
            PaymentGW-->>WalletApp: Transaction SUCCESS

            par Parallel Native Return & Webhook Confirmation
                WalletApp->>Passenger: OS Deep-Link Jump Back ('taxiapp://payment-callback?status=success')
                Passenger->>Gateway: GET /api/v1/payments/status/{rideID}
            and Secure Webhook Notification
                PaymentGW->>Gateway: POST /api/v1/payments/webhook (HMAC Signature, Payload)
                Gateway->>PaymentSvc: VerifyWebhookSignature(payload)
                PaymentSvc->>PaymentGW: VerifyTransactionStatus(orderID)
                PaymentGW-->>PaymentSvc: 200 OK (Transaction Verified & Settled)
                PaymentSvc->>PaymentSvc: UpdateRidePaymentStatus(rideID, 'SUCCESS')
                PaymentSvc->>PaymentSvc: CreditDriverWalletBalance(driverID, netAmount)
            end

            PaymentSvc--)Passenger: Push/WS: Payment Confirmed (Receipt)
            PaymentSvc--)Driver: Push/WS: Payment Confirmed (Receipt)
        end
    end

    rect rgb(250, 250, 250)
        Note over Passenger, Guardian: Phase 2: Safety Teardown & Trip Completion
        PaymentSvc->>SafetySvc: FinalizeRideSafety(rideID)

        par Guardian Shield Deactivation
            SafetySvc->>Guardian: Push Notification: "Family member has safely arrived at destination!"
            SafetySvc->>Guardian: Stop Live Location Share Channel
            Guardian->>Guardian: Deactivate Guardian Screen
        and Driver Protecting Mode Deactivation
            SafetySvc-->>Driver: Protecting Mode Deactivated
            Driver->>Driver: Stop In-Car CCTV Recording & Finalize File Upload
            Driver->>Driver: Stop High-Frequency GPS Logging
        end

        Passenger->>Passenger: Display "Thank You" Screen & Driver Rating
        Driver->>Driver: Display "Thank You" Screen & Earnings Credit
    end

    rect rgb(255, 255, 255)
        Note over Driver, PaymentGW: Phase 3: Driver Daily Sales & Payout Transfer
        Driver->>Gateway: GET /api/v1/drivers/sales/today
        Gateway->>PaymentSvc: GetTodaySalesSummary(driverID)
        PaymentSvc-->>Driver: 200 OK (Total Trips, Gross Sales, Platform Fee, Available Balance)

        Driver->>Gateway: POST /api/v1/drivers/wallet/transfer (Amount, PayoutChannel="KBZPAY")
        Gateway->>PaymentSvc: RequestDriverPayout(driverID, amount, channel)
        PaymentSvc->>PaymentGW: DisburseFundsToDriver(driverPhone, amount)
        PaymentGW-->>PaymentSvc: Payout Success (TxRef: "TXN-998877")
        PaymentSvc->>PaymentSvc: DeductDriverWalletBalance(driverID, amount)
        PaymentSvc-->>Driver: Payout Successful (Funds transferred to E-Wallet)
        Driver->>Driver: Return to Landing Page (Status: AVAILABLE)
    end
```

---

### 2.7 Component & System Architecture Diagram

```mermaid
flowchart TB
    %% Global Styling Classes (Black & White UML Theme)
    classDef clientTier fill:#ffffff,stroke:#000000,stroke-width:2px,color:#000000;
    classDef gatewayTier fill:#f9f9f9,stroke:#000000,stroke-width:2px,color:#000000,font-weight:bold;
    classDef serviceTier fill:#ffffff,stroke:#000000,stroke-width:1.5px,color:#000000;
    classDef dataTier fill:#ffffff,stroke:#000000,stroke-width:2px,stroke-dasharray: 4 2,color:#000000;
    classDef externalTier fill:#ffffff,stroke:#000000,stroke-width:2px,stroke-dasharray: 2 2,color:#000000;

    %% 1. Client Tier
    subgraph TierClients ["1. Client Tier (Native iOS Swift & Android Kotlin)"]
        direction LR
        subgraph AppPassenger ["Passenger Native Mobile App"]
            P_UI["SwiftUI / Jetpack Compose UI"]
            P_Location["CoreLocation / FusedLocation"]
            P_PayLink["Deep-Link Payment Handler"]
        end

        subgraph AppDriver ["Driver Native Mobile App"]
            D_UI["Driver UI & Shift Controller"]
            D_CCTV["CCTV Hardware / CameraX Engine"]
            D_GPSLog["High-Precision GPS Telemetry"]
            D_Wallet["Sales Summary & Payout UI"]
        end

        subgraph AppGuardian ["Guardian Native Mobile View"]
            G_UI["Family Tracking Map UI"]
            G_Alert["Emergency Alert Receiver"]
        end
    end

    %% 2. Edge Gateway
    subgraph TierGateway ["2. Edge & API Gateway Tier"]
        APIGateway["Go API Gateway & Reverse Proxy\n- TLS 1.3 Termination\n- JWT Claims & Auth Verification\n- Rate Limiting & Request Throttling\n- WebSocket / gRPC Connection Multiplexer"]:::gatewayTier
    end

    %% 3. Application Tier
    subgraph TierServices ["3. Go Backend Core Application Tier (Clean Architecture)"]
        direction TB
        subgraph SvcAuth ["Auth & User Service"]
            S_User["User & Driver Profile Manager"]
            S_Family["Family / Guardian Relation Manager"]
        end

        subgraph SvcDispatch ["Ride & Dispatch Engine"]
            S_Route["Multi-Stop Route & Fare Estimator"]
            S_Matching["Spatial Matchmaker & Driver Cascader"]
            S_RideState["Ride Lifecycle State Machine"]
        end

        subgraph SvcRealtime ["Real-Time & Telemetry Hub"]
            S_WSHub["WebSocket Connection Hub"]
            S_Chat["In-App Chat Router"]
            S_GPSIngest["GPS Stream Processor"]
        end

        subgraph SvcSafety ["Safety & CCTV Ingestion Service"]
            S_Geofence["Route Deviation & Geofence Engine"]
            S_CCTVUpload["Encrypted CCTV Chunk Ingester"]
            S_AlertRouter["Emergency Alert Dispatcher"]
        end

        subgraph SvcBilling ["Payment & Driver Wallet Service"]
            S_PayGateway["E-Wallet Deep-Link & Webhook Handler"]
            S_CashConfirm["Cash Settlement Handler"]
            S_Ledger["Driver Wallet Ledger & Payout Engine"]
        end

        subgraph SvcNotify ["Notification Worker"]
            S_Push["Push Notification Dispatcher (APNs / FCM)"]
        end
    end

    %% 4. Data & Persistence Tier
    subgraph TierData ["4. Persistence, Cache & Storage Tier"]
        direction LR
        DB_Postgres[("PostgreSQL 16 + PostGIS\n- Users, Guardians, Drivers\n- Rides, Waypoints, Ledger\n- Spatial Indexes (GIST)")]:::dataTier
        Cache_Redis[("Redis 7 Cluster\n- Geospatial Index (GEOADD/GEORADIUS)\n- Pub/Sub Message Bus\n- Distributed Locks (Redlock)")]:::dataTier
        Storage_S3[("Encrypted Cloud Object Storage (S3)\n- CCTV Video Chunks & Hashes\n- Driver License & ID Documents\n- Digital Payment Receipts")]:::dataTier
    end

    %% 5. External Tier
    subgraph TierExternal ["5. External Services & Payment Gateways"]
        direction LR
        Ext_Map["Routing / Map API\n(OSRM / Mapbox)"]:::externalTier
        Ext_Payment["E-Wallets (KBZPay / AYAPay / WavePay)"]:::externalTier
        Ext_Push["Push Notification Services (Apple APNs / Google FCM)"]:::externalTier
    end

    %% Client Connections
    AppPassenger -->|"HTTPS / WSS"| APIGateway
    AppDriver -->|"HTTPS / WSS / gRPC"| APIGateway
    AppGuardian -->|"HTTPS / WSS"| APIGateway

    %% Gateway to Services
    APIGateway --> SvcAuth
    APIGateway --> SvcDispatch
    APIGateway --> SvcRealtime
    APIGateway --> SvcSafety
    APIGateway --> SvcBilling

    %% Inter-service
    S_Matching -->|"Query Nearby"| Cache_Redis
    S_GPSIngest -->|"Publish Location"| Cache_Redis
    Cache_Redis -->|"Consume Stream"| S_WSHub
    S_GPSIngest -->|"Feed Coords"| S_Geofence
    S_Geofence -->|"Trigger Alert"| S_AlertRouter
    S_AlertRouter -->|"Send Push"| S_Push
    S_PayGateway -->|"Credit Earnings"| S_Ledger

    %% Persistence
    S_User & S_Family --> DB_Postgres
    S_Route & S_RideState --> DB_Postgres
    S_Chat & S_GPSIngest --> DB_Postgres
    S_Ledger & S_CashConfirm --> DB_Postgres
    S_CCTVUpload --> Storage_S3

    %% External
    S_Route --> Ext_Map
    S_Geofence --> Ext_Map
    S_PayGateway --> Ext_Payment
    S_Ledger --> Ext_Payment
    S_Push --> Ext_Push
```

---

### 2.8 State Machine Diagrams (UML 2.5)

#### 2.8.1 Ride Order Lifecycle State Machine

```mermaid
stateDiagram-v2
    [*] --> DRAFT : User opens Call Taxi screen

    state DRAFT {
        [*] --> SelectingPickup
        SelectingPickup --> SelectingDestination : Pickup confirmed
        SelectingDestination --> AddingExtraStops : Add extra waypoint
        AddingExtraStops --> SelectingDestination : Stop added
        SelectingDestination --> EstimatingFare : Waypoints finalized
        EstimatingFare --> FareCalculated : Route polyline & Fare ready
    }

    DRAFT --> SEARCHING : User taps "Call Now" / lock estimated fare
    DRAFT --> CANCELLED : User discards booking

    state SEARCHING {
        [*] --> RadiusSearch
        RadiusSearch --> DriverEvaluation : Query Redis PostGIS
        DriverEvaluation --> DispatchOffer : Candidate driver found
    }

    SEARCHING --> DISPATCHED : Push offer to candidate driver

    state DISPATCHED {
        [*] --> OfferPending
        OfferPending --> OfferTimeout : Timer > 15 seconds
        OfferPending --> DriverRejected : Driver taps Reject
    }

    DISPATCHED --> SEARCHING : [Driver rejected OR Timeout] / Cascade to next driver
    SEARCHING --> NO_DRIVER_FOUND : [All nearby drivers exhausted]
    NO_DRIVER_FOUND --> [*] : Notify user to retry

    DISPATCHED --> DRIVER_ACCEPTED : Driver taps Accept

    state DRIVER_ACCEPTED {
        [*] --> InitChatSession
        InitChatSession --> EnRoutePickup : Open WebSocket & map stream
    }

    DRIVER_ACCEPTED --> ARRIVED_AT_PICKUP : Driver reaches pickup coordinates / tap "Arrived"

    state ARRIVED_AT_PICKUP {
        [*] --> CloseChat
        CloseChat --> WaitingPassenger : Push notification to passenger
    }

    ARRIVED_AT_PICKUP --> IN_TRANSIT : Driver taps "Start Ride" / Passenger boards

    state IN_TRANSIT {
        [*] --> DualSafetyActive
        state DualSafetyActive {
            [*] --> MonitoringRoute
            MonitoringRoute --> DeviationAlert : [GPS offset > 300m] / Alert Guardian
            DeviationAlert --> MonitoringRoute : Resolved / Back on track
        }
        --
        state MeteringAndCCTV {
            [*] --> LoggingGPSAndVideo
            LoggingGPSAndVideo --> ChunkCloudSync : Every 60s
            ChunkCloudSync --> LoggingGPSAndVideo
        }
    }

    IN_TRANSIT --> ARRIVED_AT_DESTINATION : Driver taps "Arrived Destination"

    state ARRIVED_AT_DESTINATION {
        [*] --> CalculateFinalFare
        CalculateFinalFare --> AwaitingPaymentChoice : Fare displayed on both apps
    }

    ARRIVED_AT_DESTINATION --> PAYMENT_PROCESSING : Passenger selects Cash or Cashless

    state PAYMENT_PROCESSING {
        [*] --> PaymentFork
        PaymentFork --> CashFlow : Cash chosen
        CashFlow --> CashConfirmed : Driver confirms cash receipt

        PaymentFork --> CashlessFlow : E-Wallet chosen (KPay/AYAPay)
        CashlessFlow --> DeepLinkWallet : Launch Native E-Wallet
        DeepLinkWallet --> WebhookVerification : Gateway webhook received
        WebhookVerification --> CashlessSettled : Signature verified & funds captured
    }

    PAYMENT_PROCESSING --> COMPLETED : Payment settled

    state COMPLETED {
        [*] --> TeardownSafety
        TeardownSafety --> DeactivateGuardian : Notify Guardian "Safely Arrived"
        TeardownSafety --> DeactivateCCTV : Stop video & log final metadata
        DeactivateGuardian --> DisplayThankYou : Digital receipt generated
        DeactivateCCTV --> DisplayThankYou
    }

    COMPLETED --> [*] : Ride archived & Driver wallet credited

    %% Global Cancellations
    SEARCHING --> CANCELLED : Passenger cancels request
    DRIVER_ACCEPTED --> CANCELLED : Passenger/Driver cancels with penalty
    CANCELLED --> [*] : State persisted & resources released
```

---

#### 2.8.2 Driver Operational Status & Shift State Machine

```mermaid
stateDiagram-v2
    [*] --> OFFLINE : Driver opens app

    state OFFLINE {
        [*] --> LoggedOut
        LoggedOut --> Authenticating : Enter Credentials / OTP
        Authenticating --> VerificationCheck : Verify Driver License & Vehicle
    }

    OFFLINE --> AVAILABLE : Driver logs in / Start Shift

    state AVAILABLE {
        [*] --> IdleGeoBroadcasting
        IdleGeoBroadcasting --> GeoStream : Stream GPS every 5s to Redis
        GeoStream --> IdleGeoBroadcasting : Keepalive heartbeat
    }

    AVAILABLE --> BREAK_TIME : Driver toggles "Break Time"
    BREAK_TIME --> AVAILABLE : Driver toggles "Available"

    AVAILABLE --> ON_ANOTHER_DUTY : Driver toggles "On Another Duty"
    ON_ANOTHER_DUTY --> AVAILABLE : Driver toggles "Available"

    AVAILABLE --> DISPATCH_OFFER_RECEIVED : Dispatch engine matches ride

    state DISPATCH_OFFER_RECEIVED {
        [*] --> CountdownTimer
        CountdownTimer --> EvaluateRouteFare : Review pickup, route & fare
    }

    DISPATCH_OFFER_RECEIVED --> AVAILABLE : [Timeout > 15s OR Driver Rejects]
    DISPATCH_OFFER_RECEIVED --> EN_ROUTE_TO_PICKUP : Driver taps "Accept"

    state EN_ROUTE_TO_PICKUP {
        [*] --> NavigatePickup
        NavigatePickup --> ActiveChatSession : Chat with passenger open
    }

    EN_ROUTE_TO_PICKUP --> AT_PICKUP_POINT : Driver arrives at pickup coordinates

    state AT_PICKUP_POINT {
        [*] --> ChatClosed
        ChatClosed --> AwaitingPassengerBoarding : Wait for passenger
    }

    AT_PICKUP_POINT --> ON_TRIP_PROTECTED : Driver taps "Start Ride"

    state ON_TRIP_PROTECTED {
        [*] --> ProtectingModeActive
        state ProtectingModeActive {
            [*] --> CCTVRecording
            CCTVRecording --> GPSHighFreqLogging : 10Hz stream
            GPSHighFreqLogging --> MeteringRunning : Fare clock active
        }
    }

    ON_TRIP_PROTECTED --> AT_DESTINATION : Driver arrives at final destination

    state AT_DESTINATION {
        [*] --> MeterStopped
        MeterStopped --> DisplayFare : Show final taxi fare
    }

    AT_DESTINATION --> PAYMENT_CONFIRMATION : Passenger settles bill

    state PAYMENT_CONFIRMATION {
        [*] --> AwaitMethod
        AwaitMethod --> CashPayment : Confirm cash received
        AwaitMethod --> CashlessPayment : Gateway webhook confirmation
    }

    PAYMENT_CONFIRMATION --> AVAILABLE : Payment Confirmed / Trip Closed & Protecting Mode Stopped

    AVAILABLE --> SALES_SUMMARY_VIEW : Driver opens "Sales Summary"

    state SALES_SUMMARY_VIEW {
        [*] --> FetchTodayOrders
        FetchTodayOrders --> DisplayGrossNetEarnings : View earnings & commission
    }

    SALES_SUMMARY_VIEW --> TRANSFER_SALES : Driver taps "Transfer Sales"

    state TRANSFER_SALES {
        [*] --> RequestPayout
        RequestPayout --> DisburseWallet : Transfer to KBZPay / AYAPay
        DisburseWallet --> PayoutSuccess : Balance updated
    }

    TRANSFER_SALES --> SALES_SUMMARY_VIEW : Payout completed
    SALES_SUMMARY_VIEW --> AVAILABLE : Return to Landing Page

    AVAILABLE --> OFFLINE : Driver taps "Log Out" / End Shift
    BREAK_TIME --> OFFLINE : Driver taps "Log Out"
    ON_ANOTHER_DUTY --> OFFLINE : Driver taps "Log Out"

    OFFLINE --> [*]
```

---

#### 2.8.3 Guardian & CCTV Safety Subsystem State Machine

```mermaid
stateDiagram-v2
    [*] --> SAFETY_STANDBY : Family relationship registered

    state SAFETY_STANDBY {
        [*] --> InactiveSession
        InactiveSession --> AwaitRideStart : Listening for family ride events
    }

    SAFETY_STANDBY --> DUAL_PROTECTION_ENGAGED : Ride Start Event Triggered

    state DUAL_PROTECTION_ENGAGED {
        %% Guardian Subsystem
        state GuardianSubsystem {
            [*] --> GuardianNotified
            GuardianNotified --> LiveLocationSharing : Send Driver & Vehicle metadata

            state LiveLocationSharing {
                [*] --> OnRouteNormal
                OnRouteNormal --> RouteDeviationAlert : [Distance to planned route > 300m]
                RouteDeviationAlert --> OnRouteNormal : [Vehicle returns to route]
                RouteDeviationAlert --> EmergencyEscalation : [No correction after 2 mins / SOS pressed]
                EmergencyEscalation --> LawEnforcementDispatch : High-priority safety response
            }
        }
        --
        %% Driver In-Car Protecting Subsystem
        state ProtectingCCTVSubsystem {
            [*] --> HardwareInit
            HardwareInit --> CCTVRecordingActive : Camera capture pipeline engaged

            state CCTVRecordingActive {
                [*] --> ChunkBuffering
                ChunkBuffering --> EncryptedCloudSync : Every 60s chunk / 1080p
                EncryptedCloudSync --> ChunkBuffering : Chunk uploaded & SHA-256 hashed
            }
        }
    }

    DUAL_PROTECTION_ENGAGED --> TRIP_DESTINATION_ARRIVED : Destination coordinates reached

    state TRIP_DESTINATION_ARRIVED {
        [*] --> AwaitPaymentSettlement
        AwaitPaymentSettlement --> SafetyShutdownInitiated : Payment confirmed
    }

    TRIP_DESTINATION_ARRIVED --> SAFETY_TEARDOWN : Finalize ride completion

    state SAFETY_TEARDOWN {
        [*] --> FinalizeGuardian
        FinalizeGuardian --> SendArrivalPush : "Family member safely arrived"
        SendArrivalPush --> CloseLocationStream : Kill WebSocket channel

        [*] --> FinalizeCCTV
        FinalizeCCTV --> FlushRemainingVideoBuffer : Upload final segment
        FlushRemainingVideoBuffer --> SealTripRecord : Generate SHA-256 integrity digest
        SealTripRecord --> StopCCTVHardware : Release camera & GPS resources
    }

    SAFETY_TEARDOWN --> SAFETY_STANDBY : Both Guardian & Protecting modes deactivated
    SAFETY_STANDBY --> [*] : User unregisters / account closed
```

---

## 3. Golang Backend Architecture & Implementation Plan

### 3.1 Project File Tree Structure
The backend follows idiomatic **Clean Architecture**:

```text
taxi-backend-go/
├── cmd/
│   └── server/
│       └── main.go                 # Application bootstrap & dependency injection
├── internal/
│   ├── domain/                     # Core Domain Entities & Business Rules
│   │   ├── user.go
│   │   ├── driver.go
│   │   ├── ride.go
│   │   ├── waypoint.go
│   │   ├── safety.go
│   │   ├── chat.go
│   │   └── payment.go
│   ├── usecase/                    # Business Logic / Application Services
│   │   ├── auth_usecase.go
│   │   ├── dispatch_usecase.go
│   │   ├── route_usecase.go
│   │   ├── safety_usecase.go
│   │   ├── chat_usecase.go
│   │   └── payment_usecase.go
│   ├── repository/                 # Data Access Interfaces & Implementations
│   │   ├── postgres/
│   │   │   ├── user_repo.go
│   │   │   ├── ride_repo.go
│   │   │   ├── driver_repo.go
│   │   │   └── wallet_repo.go
│   │   └── redis/
│   │       ├── geo_repo.go
│   │       └── lock_repo.go
│   ├── delivery/
│   │   ├── http/                   # REST API Handlers & Middleware
│   │   │   ├── router.go
│   │   │   ├── auth_handler.go
│   │   │   ├── ride_handler.go
│   │   │   └── payment_handler.go
│   │   └── ws/                     # WebSocket Hub for Telemetry & Chat
│   │       ├── hub.go
│   │       ├── client.go
│   │       └── message_handler.go
│   └── infrastructure/
│       ├── database/               # PostgreSQL & PostGIS Setup
│       ├── cache/                  # Redis Setup
│       ├── routing/                # OSRM / Map Engine Client
│       ├── storage/                # AWS S3 / Cloud Storage Client
│       └── paymentgw/              # KBZPay / AYAPay API Client
├── pkg/
│   ├── geoutil/                    # Haversine distance, Geofencing, Polyline decoding
│   ├── logger/                     # Structured Zap logger
│   └── token/                      # JWT token utilities
├── go.mod
└── go.sum
```

### 3.2 Core Golang Structs & Dispatch Engine Implementation

```go
package domain

import (
	"context"
	"time"
	"github.com/google/uuid"
)

type DriverStatus string

const (
	DriverStatusAvailable    DriverStatus = "AVAILABLE"
	DriverStatusBreak        DriverStatus = "BREAK"
	DriverStatusOnDuty       DriverStatus = "ON_DUTY"
	DriverStatusEnRoute      DriverStatus = "EN_ROUTE"
	DriverStatusInTrip       DriverStatus = "IN_TRIP"
	DriverStatusOffline      DriverStatus = "OFFLINE"
)

type RideStatus string

const (
	RideStatusDraft        RideStatus = "DRAFT"
	RideStatusSearching    RideStatus = "SEARCHING"
	RideStatusDispatched   RideStatus = "DISPATCHED"
	RideStatusAccepted     RideStatus = "ACCEPTED"
	RideStatusArrivedPickup RideStatus = "ARRIVED_PICKUP"
	RideStatusInTransit    RideStatus = "IN_TRANSIT"
	RideStatusArrivedDest  RideStatus = "ARRIVED_DEST"
	RideStatusCompleted    RideStatus = "COMPLETED"
	RideStatusCancelled    RideStatus = "CANCELLED"
)

type GeoLocation struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	Address   string  `json:"address,omitempty"`
}

type Waypoint struct {
	ID         uuid.UUID   `json:"id"`
	RideID     uuid.UUID   `json:"ride_id"`
	StopOrder  int         `json:"stop_order"`
	Location   GeoLocation `json:"location"`
	IsVisited  bool        `json:"is_visited"`
	VisitedAt  *time.Time  `json:"visited_at,omitempty"`
}

type Ride struct {
	ID               uuid.UUID    `json:"id"`
	PassengerID      uuid.UUID    `json:"passenger_id"`
	DriverID         *uuid.UUID   `json:"driver_id,omitempty"`
	VehicleID        *uuid.UUID   `json:"vehicle_id,omitempty"`
	Status           RideStatus   `json:"status"`
	Pickup           GeoLocation  `json:"pickup"`
	FinalDestination GeoLocation  `json:"final_destination"`
	Waypoints        []Waypoint   `json:"waypoints"`
	EstimatedDistKm  float64      `json:"estimated_distance_km"`
	EstimatedFare    float64      `json:"estimated_fare"`
	ActualDistKm     float64      `json:"actual_distance_km"`
	ActualFare       float64      `json:"actual_fare"`
	PaymentMethod    string       `json:"payment_method"`
	PaymentStatus    string       `json:"payment_status"`
	CreatedAt        time.Time    `json:"created_at"`
	StartedAt        *time.Time   `json:"started_at,omitempty"`
	CompletedAt      *time.Time   `json:"completed_at,omitempty"`
}

type DispatchService interface {
	CreateBooking(ctx context.Context, ride *Ride) error
	MatchAndDispatch(ctx context.Context, rideID uuid.UUID) error
	AcceptOffer(ctx context.Context, rideID, driverID uuid.UUID) error
	RejectOffer(ctx context.Context, rideID, driverID uuid.UUID) error
}
```

---

## 4. Native Mobile Architecture (iOS & Android)

### 4.1 iOS Native Architecture (SwiftUI + Combine / Swift Concurrency)
- **Pattern**: Clean MVVM (Model-View-ViewModel) with Unidirectional Data Flow.
- **Location Engine**: `CLLocationManager` running with `kCLLocationAccuracyBestForNavigation` and background modes for drivers.
- **In-Car CCTV Video Pipeline**: `AVCaptureSession` capturing 1080p/30fps H.264 video chunks, hardware-accelerated SHA-256 digest creation via `CryptoKit`, and buffered background uploads using `URLSessionUploadTask`.
- **Deep-Linking**: Universal Links and custom URL schemes (`kbzpay://`, `ayapay://`) intercepted via `onOpenURL` to resume the app and query payment verification endpoints.

### 4.2 Android Native Architecture (Kotlin + Jetpack Compose + Coroutines/Flow)
- **Pattern**: MVI (Model-View-Intent) with Kotlin Coroutines and StateFlow.
- **Location Engine**: `FusedLocationProviderClient` with `Priority.PRIORITY_HIGH_ACCURACY` wrapped in a persistent Foreground Service.
- **In-Car CCTV Video Pipeline**: `CameraX` / `VideoCapture` module recording partitioned MP4 chunks with local AES-256 encryption before streaming to backend S3 buckets.
- **Deep-Linking**: Android App Links & Intent URI filters with `FLAG_ACTIVITY_SINGLE_TOP` for seamless round-trip wallet confirmation.

### 4.3 Guardian Dynamic Feature Plugin / On-Demand Installable Package Architecture
To minimize initial app download size (~18MB core app), the **Guardian Safety Shield** is engineered as an **on-demand downloadable / installable feature plugin** (`com.taxi.plugin.guardian` / `GuardianPluginKit.framework`):

1. **On-Demand Dynamic Delivery**:
   - **Android**: Implemented as a **Play Feature Delivery Module** (`:feature_guardian`). The base app uses `SplitInstallManager` to asynchronously download (~3.8MB) and load the module without app restart.
   - **iOS**: Modular **Dynamic Framework / On-Demand Resources (ODR)** loaded via `NSBundle` dynamic linking and SPM plugin protocol interfaces.
2. **Dynamic Plugin Package Capabilities**:
   - **Family Mesh Pairing**: Dynamic QR Code and 6-digit OTP pairing tokens for instant linking between passenger and guardian family devices.
   - **Real-Time Telemetry Stream Renderer**: Direct WebRTC DataChannel & WebSocket GPS stream subscriber with 60fps vehicle position interpolation.
   - **Offline Cross-Track Geofencing**: Computes distance $d_{xt}$ locally on device against the route polyline even when network drops momentarily.
   - **Emergency SOS & Do-Not-Disturb Override**: High-priority alarm sound and auto-dispatch to emergency contacts and police dispatch.
3. **Backend Dynamic Plugin Registry (Go)**:
   - Manages signed plugin split package manifests, SHA-256 integrity digests, and version compatibility checks via `/api/v1/plugins/manifest`.

---

## 5. Security, Geofencing & Payment Specifications

### 5.1 Route Deviation & Anomaly Detection Algorithm
1. The backend stores the planned route polyline returned by the routing engine as an ordered array of coordinates.
2. Every 2 seconds, the driver's GPS coordinate $(P_{lat}, P_{lng})$ is streamed over WebSocket.
3. The Deviation Engine calculates the cross-track orthogonal distance $d_{xt}$ from $P$ to the closest polyline segment using the spherical cross-track formula:
   $$d_{xt} = \arcsin\left(\sin(\Delta_{13}) \cdot \sin(\theta_{13} - \theta_{12})\right) \cdot R$$
4. If $d_{xt} > 300\text{ meters}$ for consecutive duration $t > 45\text{ seconds}$:
   - State flips from `ON_ROUTE` to `DEVIATION_ALERT`.
   - Immediate push notification and high-priority sound alarm sent to registered family Guardians.

### 5.2 Payment Verification & Driver Wallet Security
1. All cashless transactions are signed with SHA-256 HMAC using shared secret keys provided by the banking gateway.
2. Webhooks are idempotent; requests are deduplicated using the Gateway's unique `transaction_ref` in PostgreSQL with row-level locks (`SELECT ... FOR UPDATE`).
3. Driver wallet credits and payouts utilize atomic database transactions, preventing race conditions during concurrent ride completions and sales transfer requests.

---

## 6. Draw.io (`.drawio`) Diagrams Index

All architecture models are available as native **Draw.io XML (`.drawio`)** files located in [`diagrams/drawio/`](file:///Users/stephanfilip/Yamato_project/Labar/diagrams/drawio) and at the workspace root:

| Filename | Type | Description |
|---|---|---|
|  **[`taxi_master_architecture.drawio`](file:///Users/stephanfilip/Yamato_project/Labar/taxi_master_architecture.drawio)** | **Multi-Tab Master File (Root)** | **All 11 diagrams consolidated into one interactive master file with Guardian Plugin Tab** |
|  **[`taxi_master_all_in_one.drawio`](file:///Users/stephanfilip/Yamato_project/Labar/diagrams/drawio/taxi_master_all_in_one.drawio)** | **Multi-Tab Master File (Diagrams)** | **Full 11-tab consolidated Draw.io file** |
| [`01_use_case_diagram.drawio`](file:///Users/stephanfilip/Yamato_project/Labar/diagrams/drawio/01_use_case_diagram.drawio) | Standalone Draw.io | UML 2.5 Use Case Model with Actors, Boundary & Sub-packages |
| [`02_system_process_flowchart.drawio`](file:///Users/stephanfilip/Yamato_project/Labar/diagrams/drawio/02_system_process_flowchart.drawio) | Standalone Draw.io | 5-Swimlane End-to-End System Process Flowchart |
| [`03_database_erd_schema.drawio`](file:///Users/stephanfilip/Yamato_project/Labar/diagrams/drawio/03_database_erd_schema.drawio) | Standalone Draw.io | Relational Database Schema with all 16 Connected Tables & Columns |
| [`04_component_architecture.drawio`](file:///Users/stephanfilip/Yamato_project/Labar/diagrams/drawio/04_component_architecture.drawio) | Standalone Draw.io | 5-Tier Component & Microservices Architecture |
| [`05_class_domain_architecture.drawio`](file:///Users/stephanfilip/Yamato_project/Labar/diagrams/drawio/05_class_domain_architecture.drawio) | Standalone Draw.io | UML 2.5 Class Diagram (Go Structs, Interfaces, ViewModels) |
| [`06_sequence_dispatch_chat.drawio`](file:///Users/stephanfilip/Yamato_project/Labar/diagrams/drawio/06_sequence_dispatch_chat.drawio) | Standalone Draw.io | UML 2.5 Sequence: Booking, Cascading Dispatch & Chat |
| [`07_sequence_safety_guardian_cctv.drawio`](file:///Users/stephanfilip/Yamato_project/Labar/diagrams/drawio/07_sequence_safety_guardian_cctv.drawio) | Standalone Draw.io | UML 2.5 Sequence: Guardian Tracking & CCTV Protecting Mode |
| [`08_sequence_payment_and_payout.drawio`](file:///Users/stephanfilip/Yamato_project/Labar/diagrams/drawio/08_sequence_payment_and_payout.drawio) | Standalone Draw.io | UML 2.5 Sequence: E-Wallet Deep-linking, Webhooks & Payout |
| [`09_state_machine_ride_lifecycle.drawio`](file:///Users/stephanfilip/Yamato_project/Labar/diagrams/drawio/09_state_machine_ride_lifecycle.drawio) | Standalone Draw.io | UML 2.5 State Machine: Complete Ride Lifecycle |
| [`10_state_machine_driver_status.drawio`](file:///Users/stephanfilip/Yamato_project/Labar/diagrams/drawio/10_state_machine_driver_status.drawio) | Standalone Draw.io | UML 2.5 State Machine: Driver Status & Shift Lifecycle |
|  **[`11_guardian_plugin_module_architecture.drawio`](file:///Users/stephanfilip/Yamato_project/Labar/diagrams/drawio/11_guardian_plugin_module_architecture.drawio)** | **Standalone Draw.io** | **Guardian On-Demand Dynamic Plugin Package & Host Architecture** |

### How to Open & Edit `.drawio` Files:
1. **Web**: Visit [app.diagrams.net](https://app.diagrams.net) and drag & drop [`taxi_master_architecture.drawio`](file:///Users/stephanfilip/Yamato_project/Labar/taxi_master_architecture.drawio).
2. **Desktop App**: Open directly in [Draw.io Desktop](https://www.draw.io/).
3. **VS Code / Cursor**: Install the **Draw.io Integration** extension (`hediet.vscode-drawio`) to edit and view diagrams directly within the editor.

---

## 7. DriverReg KYC, Staff Administration, and Revised Safety UX

The v2 product architecture adds two first-class clients alongside Passenger, Driver, and Guardian:

1. **DriverReg App** — a staff-authenticated KYC capture client for consent, personal data, NRC, driving licence camera OCR, selfie/liveness and face comparison, vehicle/commercial compliance, review, and submission.
2. **Admin Control Center** — a desktop review and access-governance client for independent KYC decisions, staff invitations, roles, session revocation, and immutable audit history.

Driver onboarding is isolated from ride operations. A submitted case follows `DRAFT → SUBMITTED → IN_REVIEW → NEEDS_CORRECTION | APPROVED | REJECTED`. Only an approved case can issue a one-time activation invitation to the Driver App. The registering staff member cannot approve the same case.

`GOD_ADMIN` is a hardware-MFA, break-glass role. `CEO`, `CTO`, and `PSO` are executive labels with the same `EXEC_SUPERADMIN` permission set. `DRIVER_REGISTRAR`, `KYC_REVIEWER`, `STAFF_REGISTRAR`, `MARKETER`, `SUPPORT`, and `AUDITOR` remain separated by least-privilege scopes. A staff registrar cannot grant privileged roles.

Normal Passenger and Driver screens now expose a collapsed **Safety Drawer** instead of a dominant panic button. The drawer is reachable in one deliberate action, supports a two-second hold and cancel countdown, offers covert/silent triggering, and becomes persistently visible when an incident is active. Incoming emergency responder alerts remain interruptive.

Detailed sources:

- [`features/driver-registration-and-staff-access.md`](features/driver-registration-and-staff-access.md)
- [`design/figma-prototype-plan.md`](design/figma-prototype-plan.md)
- [`architecture/database-design.md`](architecture/database-design.md)
- [`public/wireframes/labar_master_figma_canvas_v2.svg`](public/wireframes/labar_master_figma_canvas_v2.svg)

---

## 8. Go Backend Foundation and Passenger Fare Contract

The implementation under `codebase/backend` now separates process bootstrap, HTTP transport, application use cases, and domain types. It provides liveness/readiness probes, strict JSON decoding, a public fare-policy endpoint, authoritative fare quotes, the Passenger screen catalog, unit tests, transport contract tests, and privacy-oriented contributor instructions.

Fare policy `MM-2026-08-v1` defines a 5,000 MMK transport minimum through 2.0 km, a 1,500 MMK service fee on every route, and 150 MMK for each started 0.1 km beyond 2.0 km. Digital payments retain the exact subtotal. Cash rounds upward to the next 500 MMK. One LaBar promo credit equals 10 MMK and discounts transport without removing the service fee.

The Passenger product lifecycle now contains Splash, Home, Pickup / Map, Route & Fees, Choose Ride, Payment, Finding Driver, Driver On The Way, Driver Details, On Trip, Trip Complete, My Trips, Profile, LaBar Credit, Guardian Plugin, Saved Places, Support, Schedule Ride, and Settings. Estimates and receipts must use the server quote policy version and itemized breakdown.

Implementation sources:

- [`codebase/backend/README.md`](codebase/backend/README.md)
- [`guide/backend-implementation-plan.md`](guide/backend-implementation-plan.md)
- [`features/fare-and-labar-credit.md`](features/fare-and-labar-credit.md)
- [`design/passenger-product-pages.md`](design/passenger-product-pages.md)
- [`public/prototypes/passenger-v2.html`](/prototypes/passenger-v2.html)
