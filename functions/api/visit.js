/**
 * Cloudflare Pages Function: POST /api/visit
 *
 * One atomic D1 increment per page load, then returns the new total.
 * Binding: VISITS_DB (D1)
 */
export async function onRequestPost({ env }) {
  if (!env?.VISITS_DB) {
    return Response.json(
      { error: 'VISITS_DB binding is not configured' },
      { status: 503, headers: { 'cache-control': 'no-store' } },
    )
  }

  try {
    const row = await env.VISITS_DB.prepare(
      `INSERT INTO counters (name, value)
       VALUES ('site_visits', 1)
       ON CONFLICT(name) DO UPDATE SET value = counters.value + 1
       RETURNING value`,
    ).first()

    const count = Number(row?.value)
    if (!Number.isFinite(count)) throw new Error('invalid counter value')

    return Response.json(
      { count },
      {
        headers: {
          'cache-control': 'no-store',
          'content-type': 'application/json; charset=utf-8',
        },
      },
    )
  } catch (error) {
    console.error('visit counter failed', error)
    return Response.json(
      { error: 'visit counter unavailable' },
      { status: 503, headers: { 'cache-control': 'no-store' } },
    )
  }
}
