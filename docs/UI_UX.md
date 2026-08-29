# Neram UI/UX standard

## Product personality

Neram should feel:
- operational
- trustworthy
- fast
- calm under pressure
- distinctly Chennai without looking gimmicky

It should not feel like:
- a generic SaaS admin template
- a consumer navigation app
- a flashy cyber/emergency concept demo

## Information hierarchy

For police users, the order of importance is:
1. An active ambulance is approaching
2. Which signal it is approaching
3. How soon it will arrive
4. Which direction it is coming from
5. Whether the alert has been acknowledged/cleared
6. Secondary map, route, vehicle, and telemetry detail

## Interaction principles

- One glance should answer the officer's immediate question: “Is an ambulance coming to my signal, and when?”
- The acknowledgement action should be reachable in one tap/click.
- Avoid modal chains during active alerts.
- Do not rely on color alone for status.
- Use consistent status chips, icons, labels, and timestamps.
- Preserve alert state through refresh/reconnect.
- Never make the officer hunt through tables to find the active emergency.

## Visual system

Use a small tokenized system rather than ad-hoc styling:
- spacing scale
- type scale
- border/radius scale
- elevation rules
- status semantics
- interactive states

Semantic states should include at least:
- neutral
- active/urgent
- acknowledged
- cleared/success
- warning/stale
- offline/error

The exact palette can evolve, but semantic meaning must remain stable.

## Motion

Motion is functional:
- incoming alerts may enter subtly
- live-location updates should interpolate smoothly when appropriate
- cleared alerts should resolve cleanly
- respect prefers-reduced-motion

Never use constant flashing, strobing, or animations that could interfere with an officer's situational awareness.

## Responsive design

### Desktop
Optimize for a control-room dashboard with:
- active-alert rail
- operational map
- signal/ambulance details
- connection/system state

### Tablet/mobile police view
Optimize for field use:
- active alert first
- large touch targets
- compact map context
- clear acknowledgement

### Ambulance phone
Optimize for minimum driver interaction:
- current emergency state
- tracking health
- trip destination
- start/end emergency workflow

## Failure states

Every live-data surface must have designed states for:
- loading
- no active ambulances
- no assigned signal
- GPS unavailable
- stale GPS
- network disconnected
- realtime reconnecting
- alert expired
- route unavailable
- server error

These must explain what happened without exposing implementation jargon.

## Demo quality

Anything visible in a project demo should look intentional. No raw JSON, default browser buttons, empty placeholder cards, lorem ipsum, debug labels, or unfinished dashboard sections in the primary user journey.
