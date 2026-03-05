---
id: customer-onboarding
name: Customer Onboarding
domain: platform
participants:
  - service: auth-service
    role: Creates user account and credentials
  - service: crm-service
    role: Creates customer profile record
  - service: billing-service
    role: Sets up payment method and billing preferences
  - service: policy-service
    role: Evaluates onboarding eligibility rules
---

# Overview

New customer registration and account setup. Creates authentication credentials,
initializes customer profile, and sets up billing preferences.

```bpmn
process: customer-onboarding
  name: "Customer Onboarding"

  start: registration-started
    name: "Registration Started"
    -> check-eligibility

  task: check-eligibility
    name: "Check Eligibility"
    type: service
    service: policy-service
    doc: eligibility-check
    -> eligibility-decision

  gateway: eligibility-decision
    name: "Eligible?"
    type: exclusive
    -> create-account {condition: "eligible", name: "Yes"}
    -> rejected {condition: "not eligible", name: "No"}

  end: rejected
    name: "Registration Rejected"

  task: create-account
    name: "Create User Account"
    type: service
    service: auth-service
    doc: account-creation
    -> create-profile

  task: create-profile
    name: "Create Customer Profile"
    type: service
    service: crm-service
    doc: profile-creation
    -> setup-billing

  task: setup-billing
    name: "Setup Billing Account"
    type: service
    service: billing-service
    doc: billing-setup
    -> onboarding-complete

  end: onboarding-complete
    name: "Onboarding Complete"
```

## Eligibility Check {#eligibility-check}

The policy service evaluates registration data against configurable eligibility
rules. Checks include region restrictions, duplicate detection, and fraud
signals. Rejected registrations receive immediate feedback with the reason.

**Endpoint:** `POST /evaluate`

## Account Creation {#account-creation}

Auth service creates the user record with hashed credentials and generates
an email verification token. The account starts in a `pending_verification`
state until the customer confirms their email.

**Endpoint:** `POST /users`

## Profile Creation {#profile-creation}

CRM service initializes the customer profile with data collected during
registration — name, contact details, and communication preferences. The
profile is linked to the auth user record via the shared customer ID.

**Endpoint:** `POST /customers`

## Billing Setup {#billing-setup}

Billing service creates the billing account and stores payment preferences.
No payment method is required at this stage; it can be added later. A welcome
email is triggered once the billing account is active.

**Endpoint:** `POST /accounts`
