"use client";

import { useState } from "react";

const books=[
 {stage:"Read this week",title:"The Mom Test",author:"Rob Fitzpatrick",why:"Learn to get truth from customer conversations instead of polite encouragement.",tone:"blue"},
 {stage:"Read this week",title:"Make It Stick",author:"Brown, Roediger & McDaniel",why:"Ground the engine’s bets about retrieval, spacing, and difficulty in learning science.",tone:"green"},
 {stage:"Next 90 days",title:"The SaaS Playbook",author:"Rob Walling",why:"Practical bootstrapped SaaS guidance on pricing, positioning, and first customers.",tone:"gold"},
 {stage:"Next 90 days",title:"Obviously Awesome",author:"April Dunford",why:"Make external buyers instantly understand what the engine is and why it is for them.",tone:"purple"},
 {stage:"Build + sell",title:"Zero to Sold",author:"Arvid Kahl",why:"A complete small-team SaaS lifecycle that closely matches this journey.",tone:"blue"},
 {stage:"Build + sell",title:"Traction",author:"Weinberg & Mares",why:"Find one customer-acquisition channel systematically instead of guessing.",tone:"gold"},
 {stage:"Protect focus",title:"Deep Work",author:"Cal Newport",why:"Protect uninterrupted attention—the scarcest resource across several products.",tone:"green"},
];
const phases=[
 {id:"0",time:"This week",title:"Name the uncertainty",body:"Lead IRAP with the scientific question, not completed engineering. Write one measurable question for the next three months.",signal:"One measurable research question",icon:"?"},
 {id:"1",time:"Next few months",title:"Prove it inside Brightwick",body:"Run shadow mode, define the outcome before activation, and refuse features that cannot trace to measurable learning value.",signal:"A credible learning-outcome number",icon:"◉"},
 {id:"2",time:"After real evidence",title:"Turn proof into product",body:"Package onboarding, documentation, positioning, and pricing. Conduct 10–15 truth-seeking discovery conversations before the first external tenant.",signal:"Repeatable external onboarding",icon:"◇"},
 {id:"3",time:"Then",title:"Grow deliberately",body:"Choose one acquisition channel and go deep. Keep the auditable, privacy-first Canadian story at the centre.",signal:"One working acquisition channel",icon:"↗"},
];
const communities=[
 {group:"SaaS peers",rule:"Pick one",names:["Indie Hackers","MicroConf Connect","Ramen Club"],note:"Candid operational advice from founders at a similar stage."},
 {group:"Canada + Toronto",rule:"Pick one",names:["DMZ","MaRS","Communitech","Startup Grind Toronto"],note:"Local advisory, funding, founder education, and trusted introductions."},
 {group:"EdTech later",rule:"Keep on radar",names:["ASU+GSV Summit","SXSW EDU"],note:"Useful when externalizing and ready for rooms of buyers and specialist investors."},
];

export function FounderFieldGuide(){
 const [activePhase,setActivePhase]=useState(1);const [selectedCommunity,setSelectedCommunity]=useState<Record<string,string>>({});const [focus,setFocus]=useState(70);
 return <>
  <header className="section-header"><div className="eyebrow"><span/>Founder field guide</div><h1>Go all in—smart.</h1><p>For the Adaptive Engine, Brightwick, and the road ahead. A practical guide to turning earned momentum into one focused, measurable company-building journey.</p></header>
  <section className="allin-hero">
   <div className="allin-orbit"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="orbit-core"><strong>ONE</strong><span>measurable job</span></div><i className="satellite sat-one">Brightwick</i><i className="satellite sat-two">Engine</i><i className="satellite sat-three">Evidence</i></div>
   <div><span>You are not at the starting line</span><h2>You already have proof that you finish things.</h2><p>A working engine, real algorithm logic, privacy-first boundaries, a live product to integrate, and a funding path in motion. The challenge is no longer starting. It is showing up on the ordinary Tuesday after the excitement cools.</p><blockquote>Dogfood first. Sell second. That sequence is the strategy.</blockquote></div>
  </section>
  <section className="earned-advantages">{[["01","You own the first customer","Brightwick is design partner, test lab, and proof—not a cold prospect."],["02","The outcome matters","Kids learning better is a durable why through the boring work."],["03","There is open ground","Canadian engine-as-API infrastructure has a credible funding and market story."]].map(([n,t,b])=><article key={n}><i>{n}</i><h3>{t}</h3><p>{b}</p></article>)}</section>

  <section className="focus-warning"><div><span>The honest thing</span><h2>Five half-built things lose to one that works.</h2><p>The engine does not need to become a SaaS the day you decide it will. It needs to become undeniably good at one job for one product first.</p></div><div className="focus-meter"><header><span>Focused energy</span><strong>{focus}%</strong></header><input type="range" min="20" max="100" value={focus} onChange={e=>setFocus(Number(e.target.value))}/><div style={{"--focus":`${focus}%`} as React.CSSProperties}><i/><span>Scattered</span><span>Shipping</span></div><small>{focus<50?"Too many fronts. Remove a commitment before adding work.":focus<80?"Protect deeper blocks and keep the next outcome singular.":"Strong focus. Keep the mission measurable and resist feature drift."}</small></div></section>

  <div className="guidance-label"><span>MAP</span><div><h2>The journey, in order</h2><p>Sequencing—not a giant list to attack simultaneously.</p></div></div>
  <section className="allin-map"><div className="map-track"><i style={{width:`${activePhase/3*100}%`}}/>{phases.map((p,i)=><button className={i===activePhase?"active":i<activePhase?"passed":""} key={p.id} onClick={()=>setActivePhase(i)}><span>{p.icon}</span><small>Phase {p.id}</small></button>)}</div><article><div><span>Phase {phases[activePhase].id} · {phases[activePhase].time}</span><h2>{phases[activePhase].title}</h2><p>{phases[activePhase].body}</p></div><aside><span>Proof to leave this phase</span><strong>{phases[activePhase].signal}</strong></aside></article></section>
  <section className="phase-cards">{phases.map((p,i)=><button className={activePhase===i?"active":""} onClick={()=>setActivePhase(i)} key={p.id}><i>{p.icon}</i><span>Phase {p.id}</span><strong>{p.title}</strong><small>{p.time}</small></button>)}</section>

  <div className="guidance-label"><span>BOOK</span><div><h2>A short reading trail</h2><p>Seven useful books in deliberate order—not a productivity-shaped pile.</p></div></div>
  <section className="book-trail">{books.map((book,i)=><article className={`book-${book.tone}`} key={book.title}><div className="book-spine"><i>{i+1}</i><span>{book.stage}</span></div><div><span>{book.author}</span><h3>{book.title}</h3><p>{book.why}</p>{i<2&&<strong>Start here</strong>}</div></article>)}</section>
  <div className="book-shortcut"><span>If you read only two</span><strong>The Mom Test</strong><i>keeps you honest about what to build</i><b>＋</b><strong>Make It Stick</strong><i>keeps you honest about whether it works</i></div>

  <div className="guidance-label"><span>ROOM</span><div><h2>Join rooms with intention</h2><p>Choose one peer room and one Canadian room. Show up until people know your name.</p></div></div>
  <section className="community-picker">{communities.map(c=><article key={c.group}><header><div><span>{c.rule}</span><h3>{c.group}</h3></div><i>{selectedCommunity[c.group]?"✓":"○"}</i></header><p>{c.note}</p><div>{c.names.map(name=><button className={selectedCommunity[c.group]===name?"active":""} key={name} onClick={()=>setSelectedCommunity(current=>({...current,[c.group]:name}))}>{name}</button>)}</div></article>)}</section>

  <section className="founder-rhythm"><header><div><span>Protect the founder</span><h2>A weekly operating rhythm</h2></div><div className="rhythm-pulse"><i/><span>Steady beats heroic</span></div></header><div>{[["MON","Choose one measurable outcome","What must be true by Friday?"],["TUE–THU","Protect deep work","Build, test, observe—without context switching."],["FRI","Look at evidence","What moved? What did we learn? What stops?"],["MONTHLY","Talk to the market","Customers, reviewers, teachers, and technical peers." ]].map(([day,title,body])=><article key={day}><i>{day}</i><strong>{title}</strong><p>{body}</p></article>)}</div></section>

  <section className="allin-checklist"><header><span>The shortest version</span><h2>Five rules worth rereading.</h2></header>{["You proved you can build. Now prove it works inside Brightwick with a real learning-outcome number.","Dogfood first, sell second. Owning the first customer is the unfair advantage.","Read The Mom Test and Make It Stick before adding more books.","Join one SaaS community and one Canadian programme—not ten.","Protect focus harder than code. One thing that works beats five promising starts."].map((x,i)=><label key={x}><input type="checkbox"/><i>{i+1}</i><span>{x}</span></label>)}</section>
  <section className="allin-finale"><div className="finish-line"><i/><i/><i/><i/><i/></div><span>Your next move</span><h2>One measurable step at a time.</h2><p>Build the evidence inside Brightwick. Let the proof earn the product, the customers, and the scale.</p><button onClick={()=>window.scrollTo({top:0,behavior:"smooth"})}>Read it again ↑</button></section>
 </>;
}
