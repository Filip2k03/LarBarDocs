# Integration tests

Integration suites run against an isolated Go API and object-storage test environment. Fixtures are synthetic and may cover OTP, refresh rotation, application load/save, presign/direct upload/completion, submission ambiguity, correction, device registration, and push routing. Runtime builds never import these fixtures.

