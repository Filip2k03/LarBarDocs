CREATE TABLE registration_centers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text UNIQUE NOT NULL,
    name text NOT NULL,
    city_id uuid REFERENCES cities(id),
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE staff_credentials (
    user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    staff_id text NOT NULL,
    password_hash text NOT NULL,
    registration_center_id uuid REFERENCES registration_centers(id),
    mfa_required boolean NOT NULL DEFAULT false,
    failed_attempts smallint NOT NULL DEFAULT 0,
    locked_until timestamptz,
    password_changed_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX staff_credentials_staff_id_idx ON staff_credentials(lower(staff_id));

ALTER TABLE driver_applications
    ADD COLUMN created_by uuid REFERENCES users(id),
    ADD COLUMN assigned_to uuid REFERENCES users(id),
    ADD COLUMN registration_center_id uuid REFERENCES registration_centers(id),
    ADD COLUMN source_mode text NOT NULL DEFAULT 'self_service' CHECK(source_mode IN ('self_service','staff_assisted')),
    ADD COLUMN revision bigint NOT NULL DEFAULT 1,
    ADD COLUMN submission_idempotency_key text;

ALTER TABLE uploads ADD COLUMN application_id uuid REFERENCES driver_applications(id) ON DELETE SET NULL;
CREATE INDEX driver_applications_staff_queue_idx ON driver_applications(registration_center_id,status,updated_at DESC) WHERE source_mode='staff_assisted';
CREATE INDEX driver_applications_assigned_idx ON driver_applications(assigned_to,updated_at DESC) WHERE source_mode='staff_assisted';
CREATE INDEX driver_applications_created_by_idx ON driver_applications(created_by,updated_at DESC) WHERE source_mode='staff_assisted';

INSERT INTO roles(name) VALUES ('marketer'),('driver_registrar'),('registration_manager') ON CONFLICT DO NOTHING;
INSERT INTO permissions(name) VALUES ('driver.registration.read'),('driver.registration.create'),('driver.registration.edit'),('driver.registration.submit'),('driver.registration.manage') ON CONFLICT DO NOTHING;

INSERT INTO role_permissions(role_id,permission_id)
SELECT r.id,p.id FROM roles r CROSS JOIN permissions p
WHERE r.name IN ('marketer','driver_registrar')
  AND p.name IN ('driver.registration.read','driver.registration.create','driver.registration.edit','driver.registration.submit')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions(role_id,permission_id)
SELECT r.id,p.id FROM roles r CROSS JOIN permissions p
WHERE r.name='registration_manager'
  AND p.name IN ('driver.registration.read','driver.registration.create','driver.registration.edit','driver.registration.submit','driver.registration.manage')
ON CONFLICT DO NOTHING;
