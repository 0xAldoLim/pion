export const OPENING_TIERS=['SSS','SS','S','A','B','C','D'] as const;
export type OpeningTier=typeof OPENING_TIERS[number];
export interface OpeningProfile {family:string;tier:OpeningTier;idea:string;players:string;source:string;load:string}
/** Editorial learning tiers: plan clarity, development, breadth, and memory burden.
 * These are Pion's recommendations, not engine rankings or a claim of objective superiority.
 * GM associations refer to the family; they do not attribute every variation to that player.
 */
export const OPENING_PROFILES:OpeningProfile[]=[
  {family:'Italian Game',tier:'SSS',idea:'Develop naturally, castle, then choose a central break.',players:'Wesley So · Anish Giri · Magnus Carlsen',source:'Italian-Game',load:'Low entry burden; rich middlegames'},
  {family:"Queen's Gambit",tier:'SSS',idea:'Challenge d5 and learn central pawn structures.',players:'Ding Liren · Levon Aronian · Alexander Alekhine',source:'Queens-Gambit',load:'Clear plans; many branches'},
  {family:'Caro-Kann Defense',tier:'SS',idea:'Prepare ...d5 and develop the bishop before closing the pawn chain.',players:'Anatoly Karpov',source:'Caro-Kann-Defense',load:'Solid structure; learn the pawn breaks'},
  {family:'London System',tier:'SS',idea:'Develop the bishop outside the pawn chain; adapt the familiar setup to Black’s threats.',players:'Gata Kamsky · Magnus Carlsen',source:'London-System',load:'Accessible setup; watch early ...c5'},
  {family:'Scotch Game',tier:'SS',idea:'Open the center early and develop with tempo.',players:'Garry Kasparov · Vladimir Kramnik',source:'Scotch-Game',load:'Direct plans; some forcing theory'},
  {family:'Ruy Lopez',tier:'S',idea:'Pressure the e5 defender and prepare a longer central struggle.',players:'Anatoly Karpov · Garry Kasparov; Berlin specialist: Vladimir Kramnik',source:'Ruy-Lopez-Opening',load:'Excellent long-term study; substantial theory'},
  {family:'Nimzo-Indian Defense',tier:'S',idea:'Pin Nc3, contest e4, and weigh bishop activity against pawn structure.',players:'Aron Nimzowitsch · Mikhail Botvinnik',source:'Nimzo-Indian-Defense',load:'Flexible; requires pawn-structure understanding'},
  {family:'French Defense',tier:'A',idea:'Challenge the center with ...d5, then prepare ...c5 or ...f6.',players:'Viktor Korchnoi · Wolfgang Uhlmann · Mikhail Botvinnik',source:'French-Defense',load:'Strong counterplay; learn the locked center'},
  {family:'Sicilian Defense',tier:'A',idea:'Create an asymmetric center and active counterplay.',players:'Bobby Fischer · Garry Kasparov',source:'Sicilian-Defense',load:'High tactical and memory burden'},
  {family:"King's Indian Defense",tier:'A',idea:'Develop behind the center and time a pawn break.',players:'Garry Kasparov · Teimour Radjabov · Hikaru Nakamura',source:'Kings-Indian-Defense',load:'Dynamic plans; precise king-safety calculation'},
  {family:'Vienna Game',tier:'B',idea:'Develop Nc3 first and choose a central or kingside plan.',players:'Historical proponents: Wilhelm Steinitz · Rudolf Spielmann',source:'Vienna-Game',load:'Accessible club option; fewer elite examples'},
  {family:'Scandinavian Defense',tier:'B',idea:'Challenge e4 immediately; account for tempi if the queen recaptures.',players:'Bent Larsen; example game: Caruana–Carlsen, 2014 (Carlsen as Black)',source:'Scandinavian-Defense',load:'Direct structure; queen development needs care'},
  {family:"King's Gambit",tier:'C',idea:'Offer the f-pawn for activity while accepting king-safety risks.',players:'Boris Spassky',source:'Kings-Gambit',load:'Specialist study; demanding defensive calculation'},
];
export function openingProfile(name:string):OpeningProfile|undefined {
  return OPENING_PROFILES.find(p=>name.includes(p.family));
}
export const tierDescription='SSS–D is Pion’s editorial learning-fit scale, from the clearest starting plans to more specialist study. It weighs development, practical usefulness and theory load. Master examples refer to the opening family.';
