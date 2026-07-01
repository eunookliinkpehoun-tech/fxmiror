import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth"

export async function POST() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })

  return NextResponse.json({
    ok: false,
    message: "Aucun solde disponible pour le retrait.",
    amount: 0,
  })
}
