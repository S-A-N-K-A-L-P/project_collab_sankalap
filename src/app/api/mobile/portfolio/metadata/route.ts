import { NextResponse } from "next/server";
import { THEMES, ALL_BACKGROUNDS, ALL_THREE_SCENES } from "@/components/portfolio/themes/registry";
import { SECTION_ANIMS, CARD_STYLES, CARD_ANIMS } from "@/components/portfolio/animations";

export async function GET() {
  try {
    return NextResponse.json({
      themes: THEMES,
      backgrounds: ALL_BACKGROUNDS,
      threeScenes: ALL_THREE_SCENES,
      sectionAnims: Object.entries(SECTION_ANIMS).map(([id, val]) => ({ id, label: val.label })),
      cardStyles: CARD_STYLES,
      cardAnims: Object.entries(CARD_ANIMS).map(([id, val]) => ({ id, label: val.label })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
