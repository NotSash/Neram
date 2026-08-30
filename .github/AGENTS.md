# Neram UI/UX Rules

Treat Neram as an emergency coordination product, not a generic SaaS template. Prioritize usefulness, calm authority, clarity, trust, and speed. Use a restrained dark visual system with semantic status colors; strong typography; deliberate alignment; few but meaningful borders; layered depth; and coherent radii. Design mobile first and verify 320px through ultra-wide layouts. Mobile controls must be at least 44px where practical, inputs 16px+, and horizontal overflow is prohibited. Navigation should be compact and task-oriented.

Motion must communicate status, cause/effect, orientation, or feedback. Prefer CSS transform/opacity, never `transition: all`, and honor `prefers-reduced-motion`. Do not let animation delay emergency actions. Design loading, empty, stale, degraded, success, and error states. Never imply Neram changes traffic signals. Never show training data as live operational data. Never treat stale GPS as current. Use semantic HTML, visible focus, accessible names, and redundant non-color status cues.

Before shipping any surface ask: Is the primary task obvious in 3 seconds? Is hierarchy intentional? Is information dense but calm? Are all important states designed? Does mobile feel purpose-built rather than compressed? Does every animation have a reason? Does the result feel specific to Neram rather than AI-generated? Could an operator misunderstand the trust/safety boundary?

Reference principles: Vercel Web Interface Guidelines; Vercel Design Engineer Principles; Apple Human Interface Guidelines; Linear's recent interface refresh principles; UI/UX Pro Max.
