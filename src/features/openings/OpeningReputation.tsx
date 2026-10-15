import {openingProfile,OPENING_TIERS,tierDescription} from '../../data/opening-profiles';

export function OpeningReputation({name,compact=false}:{name:string;compact?:boolean}){
  const profile=openingProfile(name);if(!profile)return null;
  return <section className={`opening-reputation${compact?' compact':''}`} aria-label={`${name} learning tier and masters`}>
    <div className="opening-rating"><span className={`tier-stamp ${profile.tier.toLowerCase()}`} aria-label={`Learning tier ${profile.tier}`}>{profile.tier}</span><div><strong>Learning fit</strong><p>{profile.load}</p></div></div>
    <div className="opening-masters"><strong>GM & master examples</strong><p>{profile.players}</p><a className="source-link" href={`https://www.chess.com/openings/${profile.source}`} target="_blank" rel="noreferrer">Opening & player background ↗</a></div>
  </section>;
}

export function OpeningTierGuide(){return <aside className="opening-tier-guide"><div><strong>A guide to your next opening</strong><p>{tierDescription}</p></div><ol aria-label="Learning tier scale">{OPENING_TIERS.map(tier=><li className={`tier-stamp ${tier.toLowerCase()}`} key={tier}>{tier}</li>)}</ol></aside>;}
