import {
  locales,
  type Content,
  type Workspace,
  type Workflow,
  type Locale,
} from "./types";
export const FIXTURE_DATE = "2026-09-21T18:00:00.000Z";
const flow = (
  id: string,
  slug: string,
  section: string,
  accent: string,
  sourceIds: string[],
  contents: Record<Locale, Content>,
): Workflow => ({
  id,
  slug,
  section,
  accent,
  version: 1,
  stage: "draft",
  sourceIds,
  variants: Object.fromEntries(
    locales.map((locale) => [
      locale,
      { content: contents[locale], version: 1, baseVersion: 1, approval: null },
    ]),
  ) as Workflow["variants"],
  historyIds: [],
  lastOperationId: "fixture-created",
  updatedAt: FIXTURE_DATE,
});
export const suggestedContent: Record<string, Record<Locale, Content>> = {
  loom: {
    en: {
      title: "The loom that remembers",
      summary: "Follow a single thread through a century of everyday craft.",
      body: "This handloom belonged to a fictional family of weavers. A pattern grows when the shuttle carries a thread between the raised warp threads. Small marks in the wood show where generations of hands rested. Look for the carved star beside the shuttle tray.",
      imageAlt:
        "A wooden handloom with cream warp threads and a partly woven rust-red cloth.",
      decorativeImage: false,
      accessNote:
        "Enter through the east courtyard door. The route is step-free and the threshold is 12 mm high. A bench stands beside the loom. Ask at the desk for a tactile fabric sample.",
      linkLabel: "Explore the weaving collection",
    },
    fi: {
      title: "Kangaspuut muistavat",
      summary: "Seuraa yhtä lankaa arjen käsityön historiaan.",
      body: "Nämä kangaspuut kuuluivat kuvitteelliselle kutojaperheelle. Sukkula kuljettaa lankaa loimilankojen välistä ja muodostaa kuvion. Puun pienet jäljet kertovat käsien työstä. Etsi sukkulalokeron vierestä kaiverrettu tähti.",
      imageAlt:
        "Puiset kangaspuut, vaaleat loimilangat ja osittain kudottu ruosteenpunainen kangas.",
      decorativeImage: false,
      accessNote:
        "Saavu itäpihan ovesta. Reitti on portaaton, ja kynnyksen korkeus on 12 mm. Kangaspuiden vieressä on penkki. Pyydä palvelupisteestä tunnusteltava kangasnäyte.",
      linkLabel: "Tutustu kudontakokoelmaan",
    },
    es: {
      title: "El telar que recuerda",
      summary:
        "Sigue un hilo a través de la historia de la artesanía cotidiana.",
      body: "Este telar perteneció a una familia ficticia de tejedores. La lanzadera lleva el hilo entre los hilos de la urdimbre y forma el dibujo. Las pequeñas marcas en la madera muestran dónde descansaban las manos. Busca la estrella tallada junto a la bandeja.",
      imageAlt:
        "Un telar de madera con hilos de urdimbre color crema y una tela rojiza a medio tejer.",
      decorativeImage: false,
      accessNote:
        "Entra por la puerta del patio este. La ruta no tiene escalones y el umbral mide 12 mm. Hay un banco junto al telar. Pide una muestra táctil de tela en recepción.",
      linkLabel: "Explora la colección de tejidos",
    },
  },
  lantern: {
    en: {
      title: "A light carried home",
      summary: "A small lantern made long winter evenings a little brighter.",
      body: "This fictional tin lantern protected a candle from the wind. Light escaped through star-shaped holes. Hold your hand near the replica to feel its scale; please leave the original object in its case.",
      imageAlt:
        "A tin lantern with a curved handle and star-shaped holes, shown beside its open door.",
      decorativeImage: false,
      accessNote:
        "The lantern case is on the ground floor, 8 metres from the step-free entrance. A seated viewing space is available. The replica can be requested at the desk.",
      linkLabel: "Read the lantern story",
    },
    fi: {
      title: "Valo kulkee kotiin",
      summary: "Pieni lyhty valaisi pitkiä talvi-iltoja.",
      body: "Tämä kuvitteellinen peltinen lyhty suojasi kynttilää tuulelta. Valo kulki tähtiaukkojen läpi. Kokeile jäljennöksen kokoa kädelläsi. Alkuperäinen esine säilyy vitriinissä.",
      imageAlt:
        "Peltinen lyhty, kaareva kahva ja tähtimäiset aukot. Lyhdyn ovi on auki.",
      decorativeImage: false,
      accessNote:
        "Lyhty on pohjakerroksessa, 8 metrin päässä portaattomasta sisäänkäynnistä. Esinettä voi katsella istuen. Pyydä jäljennös palvelupisteestä.",
      linkLabel: "Lue lyhdyn tarina",
    },
    es: {
      title: "Una luz de camino a casa",
      summary: "Una pequeña linterna iluminaba las largas tardes de invierno.",
      body: "Esta linterna ficticia de hojalata protegía una vela del viento. La luz salía por agujeros en forma de estrella. Acerca la mano a la réplica para apreciar su tamaño. El objeto original permanece en su vitrina.",
      imageAlt:
        "Una linterna de hojalata con asa curva y agujeros en forma de estrella, con la puerta abierta.",
      decorativeImage: false,
      accessNote:
        "La vitrina está en la planta baja, a 8 metros de la entrada sin escalones. Hay espacio para observarla sentado. Pide la réplica en recepción.",
      linkLabel: "Lee la historia de la linterna",
    },
  },
  garden: {
    en: {
      title: "Seeds of a shared place",
      summary: "The museum garden grows stories as well as plants.",
      body: "In this fictional garden, neighbours exchange seeds each spring. The raised beds hold herbs once used for cooking and dyeing. Follow the scent of mint to the quiet seating area.",
      imageAlt:
        "Three raised wooden planting beds with leafy herbs and a broad path between them.",
      decorativeImage: false,
      accessNote:
        "A firm, level path connects the courtyard to the raised beds. The narrowest point is 120 cm. Seating with backrests is available beside the mint bed.",
      linkLabel: "Plan a garden visit",
    },
    fi: {
      title: "Yhteisen paikan siemenet",
      summary: "Museopuutarhassa kasvaa myös tarinoita.",
      body: "Tässä kuvitteellisessa puutarhassa naapurit vaihtavat siemeniä keväisin. Kohopenkeissä kasvaa ruoanlaittoon ja värjäykseen käytettyjä yrttejä. Seuraa mintun tuoksua rauhalliselle istumapaikalle.",
      imageAlt:
        "Kolme puista kohopenkkiä, vihreitä yrttejä ja leveä kulkuväylä penkkien välissä.",
      decorativeImage: false,
      accessNote:
        "Pihalta kohopenkeille johtaa tasainen, kiinteä polku. Kapein kohta on 120 cm. Minttupenkin vieressä on selkänojallisia istuimia.",
      linkLabel: "Suunnittele puutarhavierailu",
    },
    es: {
      title: "Semillas de un lugar compartido",
      summary: "En el jardín del museo crecen plantas e historias.",
      body: "En este jardín ficticio, los vecinos intercambian semillas cada primavera. Los bancales elevados contienen hierbas para cocinar y teñir. Sigue el aroma de la menta hasta una zona tranquila para sentarte.",
      imageAlt:
        "Tres bancales elevados de madera con hierbas verdes y un camino ancho entre ellos.",
      decorativeImage: false,
      accessNote:
        "Un camino firme y llano conecta el patio con los bancales. El punto más estrecho mide 120 cm. Hay asientos con respaldo junto al bancal de menta.",
      linkLabel: "Planifica una visita al jardín",
    },
  },
};
export function makeFixture(): Workspace {
  const incomplete = structuredClone(suggestedContent.loom);
  incomplete.en.imageAlt = "";
  incomplete.en.summary = "";
  incomplete.en.linkLabel = "Click here";
  incomplete.en.accessNote = "";
  return {
    schema: "patchwork/v1",
    workflows: [
      flow(
        "loom",
        "the-loom",
        "Room 01 · Everyday craft",
        "#d88165",
        ["source-loom", "access-loom"],
        incomplete,
      ),
      flow(
        "lantern",
        "a-light-carried-home",
        "Room 02 · After dusk",
        "#d7a555",
        ["source-lantern", "access-lantern"],
        suggestedContent.lantern,
      ),
      flow(
        "garden",
        "the-shared-garden",
        "Courtyard · Living collection",
        "#8d9b79",
        ["source-garden", "access-garden"],
        suggestedContent.garden,
      ),
    ],
    sources: [
      {
        id: "source-loom",
        title: "Curator note · the loom",
        kind: "curatorial-note",
        excerpt:
          "Authored fictional collection note: a family handloom, cream warp, rust-red unfinished textile, star carved beside the shuttle tray. No historical provenance is claimed.",
        version: 1,
        observedAt: FIXTURE_DATE,
        synthetic: true,
      },
      {
        id: "access-loom",
        title: "Access walk · room 01",
        kind: "access-audit",
        excerpt:
          "Synthetic access fixture: east courtyard entrance; step-free route; threshold 12 mm; bench beside loom; tactile fabric sample at the desk. These are authored demonstration measurements, not a surveyed venue.",
        version: 1,
        observedAt: FIXTURE_DATE,
        synthetic: true,
      },
      {
        id: "source-lantern",
        title: "Curator note · the lantern",
        kind: "curatorial-note",
        excerpt:
          "Authored fictional object: tin candle lantern with curved handle, star-shaped holes, opening door and a tactile replica. Not an actual museum record.",
        version: 1,
        observedAt: FIXTURE_DATE,
        synthetic: true,
      },
      {
        id: "access-lantern",
        title: "Access walk · room 02",
        kind: "access-audit",
        excerpt:
          "Synthetic route fixture: ground floor, 8 metres from step-free entrance, seated viewing space and replica available from the desk.",
        version: 1,
        observedAt: FIXTURE_DATE,
        synthetic: true,
      },
      {
        id: "source-garden",
        title: "Curator note · the garden",
        kind: "curatorial-note",
        excerpt:
          "Authored fictional garden: neighbours exchange seeds; raised herb beds grow cooking and dye plants; mint marks a quiet seating area.",
        version: 1,
        observedAt: FIXTURE_DATE,
        synthetic: true,
      },
      {
        id: "access-garden",
        title: "Access walk · courtyard",
        kind: "access-audit",
        excerpt:
          "Synthetic route fixture: firm level surface, narrowest width 120 cm, raised beds and seating with backrests. Not a real access assessment.",
        version: 1,
        observedAt: FIXTURE_DATE,
        synthetic: true,
      },
    ],
    revisions: [],
    publications: [],
  };
}
