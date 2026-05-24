import type { Battle } from '../types/battle';

// ─── Revolutionary War Battle Dataset ─────────────────────────────────────
// Coordinates are [latitude, longitude]

export const battles: Battle[] = [
  {
    id: 'lexington-concord',
    name: 'Lexington & Concord',
    date: 'April 19, 1775',
    year: 1775,
    month: 4,
    day: 19,
    coordinates: [42.4484, -71.2329],
    location: 'Middlesex County, Massachusetts',
    outcome: 'American Victory',
    commanders: [
      { name: 'John Parker', side: 'American', rank: 'Captain', note: 'Led Minutemen at Lexington' },
      { name: 'James Barrett', side: 'American', rank: 'Colonel', note: 'Led forces at Concord' },
      { name: 'Francis Smith', side: 'British', rank: 'Lieutenant Colonel', note: 'Commanded British regulars' },
      { name: 'Hugh Percy', side: 'British', rank: 'Brigadier General', note: 'Led relief column' },
    ],
    casualties: {
      american: { killed: 49, wounded: 41, captured: 5 },
      british: { killed: 73, wounded: 174, captured: 53 },
    },
    summary:
      'The first military engagements of the Revolutionary War. British troops marched from Boston to seize colonial arms at Concord, but were met by armed Minutemen at Lexington and again at Concord\'s North Bridge. The "shot heard round the world" ignited the war for American independence.',
    significance:
      'These battles marked the transition from colonial protests to open armed conflict. The British regulars suffered unexpected losses on the retreat back to Boston, demonstrating that colonial militias could fight effectively against professional soldiers.',
    didYouKnow:
      'Paul Revere famously rode the night before to warn the colonists, but was captured by British officers before reaching Concord. It was Samuel Prescott who completed the ride to Concord.',
    whyItMattered:
      'Lexington and Concord shattered the myth of British military invincibility and rallied colonies across America to the patriot cause. Within weeks, militias from throughout New England had gathered around Boston, beginning the siege that would last nearly a year. This was the point of no return—after April 19, 1775, reconciliation with Britain became nearly impossible.',
    quote: 'Stand your ground. Don\'t fire unless fired upon, but if they mean to have a war, let it begin here.',
    quoteSource: 'Capt. John Parker, to his Minutemen at Lexington',
    tags: ['Opening Battles', 'New England', 'Massachusetts', 'Minutemen'],
  },

  {
    id: 'bunker-hill',
    name: 'Battle of Bunker Hill',
    date: 'June 17, 1775',
    year: 1775,
    month: 6,
    day: 17,
    coordinates: [42.3762, -71.0602],
    location: 'Charlestown, Massachusetts',
    outcome: 'British Victory',
    commanders: [
      { name: 'William Prescott', side: 'American', rank: 'Colonel', note: 'Led the American defense' },
      { name: 'Israel Putnam', side: 'American', rank: 'Major General', note: 'Overall American commander' },
      { name: 'William Howe', side: 'British', rank: 'Major General', note: 'Led the British assault' },
      { name: 'Thomas Gage', side: 'British', rank: 'General', note: 'British commander-in-chief' },
    ],
    casualties: {
      american: { killed: 115, wounded: 305, captured: 30 },
      british: { killed: 226, wounded: 828 },
      notes: 'British suffered their highest casualty rate of any battle in the entire war',
    },
    summary:
      'Though technically a British victory, the Battle of Bunker Hill—actually fought mostly on nearby Breed\'s Hill—demonstrated that colonial militiamen could hold their own against professional British soldiers. Americans ran out of ammunition after three assaults and were forced to withdraw.',
    significance:
      'The massive British casualties (over 40% of their attacking force) shocked the British high command and boosted American morale enormously. It proved that colonists could stand and fight in conventional linear warfare, not just frontier skirmishing.',
    didYouKnow:
      'The famous order "Don\'t fire until you see the whites of their eyes!" was reportedly given to conserve the Americans\' scarce gunpowder. The battle was actually fought mostly on Breed\'s Hill, not Bunker Hill, due to a positioning mistake.',
    whyItMattered:
      'Bunker Hill transformed the siege of Boston into a major strategic standoff. The British could not dislodge the Americans without enormous cost, and the colonists gained the confidence that their untrained militia could challenge the most powerful army in the world. The battle led directly to George Washington\'s appointment as Commander-in-Chief of the Continental Army.',
    quote: 'I wish we could sell them another hill at the same price.',
    quoteSource: 'Nathanael Greene, after learning of British casualties',
    tags: ['New England', 'Massachusetts', 'Siege of Boston', 'Early War'],
  },

  {
    id: 'trenton',
    name: 'Battle of Trenton',
    date: 'December 26, 1776',
    year: 1776,
    month: 12,
    day: 26,
    coordinates: [40.2171, -74.7576],
    location: 'Trenton, New Jersey',
    outcome: 'American Victory',
    commanders: [
      { name: 'George Washington', side: 'American', rank: 'General', note: 'Commander-in-Chief' },
      { name: 'Nathanael Greene', side: 'American', rank: 'Major General' },
      { name: 'Johann Rall', side: 'Hessian', rank: 'Colonel', note: 'Killed during battle' },
    ],
    casualties: {
      american: { killed: 2, wounded: 5 },
      british: { killed: 22, wounded: 83, captured: 896 },
      notes: 'Nearly all Hessian defenders captured; Washington had zero combat deaths',
    },
    summary:
      'In a desperate gamble to revive the failing Revolution, Washington crossed the ice-choked Delaware River on Christmas night and launched a surprise dawn attack on Hessian forces at Trenton. The stunning victory captured nearly 900 enemy soldiers and changed the course of the war.',
    significance:
      'Trenton came when American morale was at its lowest ebb after a string of defeats in New York. The victory re-energized the Continental Army and convinced many soldiers whose enlistments were expiring to re-enlist. Thomas Paine captured the moment: "These are the times that try men\'s souls."',
    didYouKnow:
      'Washington crossed the Delaware in a nor\'easter blizzard, with sleet and freezing rain lashing his men. The famous painting by Emanuel Leutze showing calm waters dramatically understates the brutal conditions his army faced.',
    whyItMattered:
      'Trenton was perhaps the most critical turning point of the entire war. The Continental Army was dissolving—enlistments expiring, soldiers deserting, and morale shattered after defeats at Brooklyn and Manhattan. Washington\'s boldness saved the Revolution. The victory kept the army intact and the cause alive through the winter.',
    quote: 'Victory or Death.',
    quoteSource: 'George Washington\'s password for the crossing of the Delaware',
    tags: ['Middle States', 'New Jersey', 'Turning Point', 'Washington'],
  },

  {
    id: 'princeton',
    name: 'Battle of Princeton',
    date: 'January 3, 1777',
    year: 1777,
    month: 1,
    day: 3,
    coordinates: [40.3573, -74.6672],
    location: 'Princeton, New Jersey',
    outcome: 'American Victory',
    commanders: [
      { name: 'George Washington', side: 'American', rank: 'General' },
      { name: 'Hugh Mercer', side: 'American', rank: 'Brigadier General', note: 'Fatally wounded in battle' },
      { name: 'Charles Cornwallis', side: 'British', rank: 'Lieutenant General', note: 'Outwitted by Washington' },
      { name: 'Charles Mawhood', side: 'British', rank: 'Lieutenant Colonel', note: 'Led the British force' },
    ],
    casualties: {
      american: { killed: 23, wounded: 20 },
      british: { killed: 28, wounded: 58, captured: 187 },
    },
    summary:
      'Following Trenton, Washington slipped away from Cornwallis at night and struck British forces at Princeton. Washington personally rallied retreating troops and led a charge that routed the British, then withdrew northward before Cornwallis could respond.',
    significance:
      'Princeton, combined with Trenton, secured New Jersey for the patriots and forced the British to abandon much of the state. The "Ten Crucial Days" from Christmas 1776 through early January 1777 transformed the Revolution from near-collapse to renewed vigor.',
    didYouKnow:
      'Washington personally rode his horse to within 30 yards of the British line as both sides fired—aides covered their eyes expecting him to be shot dead. He emerged without a scratch, inspiring his troops to charge and break the British line.',
    whyItMattered:
      'Princeton completed the "Ten Crucial Days" that reversed the Revolution\'s fortunes. Washington demonstrated masterful generalship—using surprise, speed, and audacity to defeat a larger professional army. The victories proved that the Continental Army could match British regulars in open battle and gave Americans genuine hope that they could win the war.',
    quote: 'It\'s a fine fox chase, my boys!',
    quoteSource: 'George Washington, during the pursuit of British troops',
    tags: ['Middle States', 'New Jersey', 'Ten Crucial Days', 'Washington'],
  },

  {
    id: 'brandywine',
    name: 'Battle of Brandywine',
    date: 'September 11, 1777',
    year: 1777,
    month: 9,
    day: 11,
    coordinates: [39.8290, -75.5930],
    location: 'Chadds Ford, Pennsylvania',
    outcome: 'British Victory',
    commanders: [
      { name: 'George Washington', side: 'American', rank: 'General' },
      { name: 'Nathanael Greene', side: 'American', rank: 'Major General' },
      { name: 'William Howe', side: 'British', rank: 'General', note: 'Executed a brilliant flanking maneuver' },
      { name: 'Charles Cornwallis', side: 'British', rank: 'Lieutenant General', note: 'Led the flanking column' },
    ],
    casualties: {
      american: { killed: 300, wounded: 600, captured: 400 },
      british: { killed: 90, wounded: 488 },
    },
    summary:
      'Howe outflanked Washington\'s army along Brandywine Creek while a secondary force pinned the Americans at Chadds Ford. Despite confusion and poor intelligence, Washington\'s army fought hard and escaped destruction, though the British opened the road to Philadelphia.',
    significance:
      'The defeat opened Philadelphia—the colonial capital and seat of the Continental Congress—to British occupation. Congress fled to Lancaster, then York. However, the Continental Army survived intact and continued to contest British control of Pennsylvania.',
    didYouKnow:
      'A young 19-year-old French volunteer named the Marquis de Lafayette was wounded at Brandywine on his first day of combat. Rather than retreat, he helped organize the American withdrawal before seeking medical attention for his leg wound.',
    whyItMattered:
      'Despite the loss, Brandywine demonstrated that the Continental Army could conduct complex defensive operations and withdraw in good order rather than collapse. The survival of Washington\'s army—not the possession of any city—was what ultimately mattered. Philadelphia\'s fall actually hardened American resolve and drove foreign nations to take the war more seriously.',
    tags: ['Philadelphia Campaign', 'Pennsylvania', 'Middle States'],
  },

  {
    id: 'saratoga',
    name: 'Battle of Saratoga',
    date: 'October 17, 1777',
    year: 1777,
    month: 10,
    day: 17,
    coordinates: [43.0154, -73.5848],
    location: 'Saratoga, New York',
    outcome: 'American Victory',
    commanders: [
      { name: 'Horatio Gates', side: 'American', rank: 'Major General', note: 'Received Burgoyne\'s surrender' },
      { name: 'Benedict Arnold', side: 'American', rank: 'Major General', note: 'Hero of the fighting before his treason' },
      { name: 'Daniel Morgan', side: 'American', rank: 'Colonel', note: 'Riflemen decisive at Freeman\'s Farm' },
      { name: 'John Burgoyne', side: 'British', rank: 'General', note: 'Surrendered entire army' },
    ],
    casualties: {
      american: { killed: 90, wounded: 240 },
      british: { killed: 440, wounded: 695, captured: 6222 },
      notes: 'Entire British Northern Army of ~5,900 men surrendered',
    },
    summary:
      'General Burgoyne\'s plan to divide the colonies by seizing the Hudson Valley ended in disaster. Surrounded and facing starvation after two fierce battles at Freeman\'s Farm, Burgoyne surrendered his entire army of nearly 6,000 men—the largest British defeat in the entire war.',
    significance:
      'Saratoga was the decisive turning point of the Revolutionary War. France had been secretly supporting America, but Saratoga convinced Louis XVI to openly ally with the American cause, signing a formal Treaty of Alliance in February 1778. France\'s entry transformed a colonial revolt into a world war.',
    didYouKnow:
      'Benedict Arnold—not yet the traitor—was the true hero of Saratoga, leading the critical charges that broke Burgoyne\'s lines. He was shot in the same leg he\'d been wounded in at Quebec. The victory is often called "the turning point of the American Revolution."',
    whyItMattered:
      'Without Saratoga, there would likely be no United States. France\'s formal alliance brought professional military support, naval power, and international legitimacy. Spain and the Netherlands soon followed, turning Britain\'s war against a few rebellious colonies into a global conflict that stretched British resources to the breaking point. No single battle in American history had greater geopolitical consequences.',
    quote: 'The fortunes of war, General Gates, have made me your prisoner.',
    quoteSource: 'General John Burgoyne, upon surrendering to Horatio Gates',
    tags: ['Northern Theater', 'New York', 'Turning Point', 'French Alliance'],
  },

  {
    id: 'monmouth',
    name: 'Battle of Monmouth',
    date: 'June 28, 1778',
    year: 1778,
    month: 6,
    day: 28,
    coordinates: [40.2648, -74.2440],
    location: 'Freehold, New Jersey',
    outcome: 'Draw',
    commanders: [
      { name: 'George Washington', side: 'American', rank: 'General' },
      { name: 'Nathanael Greene', side: 'American', rank: 'Major General' },
      { name: 'Charles Lee', side: 'American', rank: 'Major General', note: 'Court-martialed for ordering retreat' },
      { name: 'Henry Clinton', side: 'British', rank: 'General', note: 'New British Commander-in-Chief' },
      { name: 'Charles Cornwallis', side: 'British', rank: 'Lieutenant General' },
    ],
    casualties: {
      american: { killed: 72, wounded: 161, captured: 132 },
      british: { killed: 147, wounded: 170, captured: 64 },
      notes: 'Many casualties from the extreme heat (estimated 100°F)',
    },
    summary:
      'The largest battle of the war in terms of troops engaged in the north. Washington intercepted Clinton\'s army marching from Philadelphia to New York after the British evacuation. General Charles Lee\'s unauthorized retreat threw the American advance into chaos, but Washington personally rallied the troops and transformed near-rout into a creditable draw.',
    significance:
      'Monmouth demonstrated the transformation wrought by Baron von Steuben\'s winter training at Valley Forge. The Continental Army fought as disciplined professionals against Britain\'s best troops in 100-degree heat, proving they had become a genuine military force.',
    didYouKnow:
      'Mary Ludwig Hays—remembered as "Molly Pitcher"—reportedly carried water to Continental soldiers and may have stepped in to fire her husband\'s cannon when he was wounded. Whether legend or fact, she became an enduring symbol of women\'s contributions to the Revolution.',
    whyItMattered:
      'Monmouth marked a turning point in the quality of the Continental Army. The professional training at Valley Forge had transformed Washington\'s ragged force into disciplined soldiers who could match British regulars in stand-up combat. Though a draw tactically, it was a strategic American victory that validated the sacrifice at Valley Forge and signaled that the war in the north had reached stalemate.',
    tags: ['Middle States', 'New Jersey', 'Valley Forge', 'Charles Lee'],
  },

  {
    id: 'kings-mountain',
    name: 'Battle of Kings Mountain',
    date: 'October 7, 1780',
    year: 1780,
    month: 10,
    day: 7,
    coordinates: [35.1379, -81.4197],
    location: 'York County, South Carolina',
    outcome: 'American Victory',
    commanders: [
      { name: 'Isaac Shelby', side: 'American', rank: 'Colonel', note: 'Overmountain Men leader' },
      { name: 'John Sevier', side: 'American', rank: 'Colonel', note: 'Led Tennessee frontier fighters' },
      { name: 'William Campbell', side: 'American', rank: 'Colonel', note: 'Commanded the American forces' },
      { name: 'Patrick Ferguson', side: 'British', rank: 'Major', note: 'Killed in battle; only British regular' },
    ],
    casualties: {
      american: { killed: 29, wounded: 58 },
      british: { killed: 157, wounded: 163, captured: 698 },
      notes: 'Ferguson\'s entire command was killed, wounded, or captured',
    },
    summary:
      'Frontier riflemen known as the "Overmountain Men" surrounded and annihilated a Loyalist force under British Major Patrick Ferguson on a wooded hilltop. Ferguson was the only British regular present; his entire command was killed or captured in just over an hour of intense fighting.',
    significance:
      'Kings Mountain ended Cornwallis\'s first invasion of North Carolina and his plans to raise a Loyalist army in the backcountry. The battle shattered Loyalist power in the South and forced Cornwallis to retreat into South Carolina.',
    didYouKnow:
      'Patrick Ferguson was the inventor of one of the world\'s first breech-loading military rifles. He had previously had George Washington in his rifle sights before letting him go out of a sense of honor—a decision that would cost him his life at Kings Mountain.',
    whyItMattered:
      'Kings Mountain was the hinge on which the Southern Campaign turned. Cornwallis had boasted that with 10,000 Loyalists he could control the South. Kings Mountain proved that claim hollow by destroying Loyalist military power and demoralizing Tory sympathizers throughout the backcountry. It set the stage for the American resurgence in the South that would culminate at Cowpens and Yorktown.',
    quote: 'Brave men, leap over, and shew your courage.',
    quoteSource: 'Patrick Ferguson, calling on his Loyalists to rally (moments before his death)',
    tags: ['Southern Campaign', 'South Carolina', 'Loyalists', 'Backcountry'],
  },

  {
    id: 'cowpens',
    name: 'Battle of Cowpens',
    date: 'January 17, 1781',
    year: 1781,
    month: 1,
    day: 17,
    coordinates: [35.1279, -81.8024],
    location: 'Cherokee County, South Carolina',
    outcome: 'American Victory',
    commanders: [
      { name: 'Daniel Morgan', side: 'American', rank: 'Brigadier General', note: 'Brilliant tactical commander' },
      { name: 'William Washington', side: 'American', rank: 'Lieutenant Colonel', note: 'Led the cavalry charge' },
      { name: 'Banastre Tarleton', side: 'British', rank: 'Lieutenant Colonel', note: 'Defeated and humiliated' },
    ],
    casualties: {
      american: { killed: 25, wounded: 124 },
      british: { killed: 110, wounded: 229, captured: 830 },
      notes: 'Tarleton\'s entire force of ~1,000 men destroyed; only Tarleton himself escaped',
    },
    summary:
      'General Daniel Morgan\'s masterful double-envelopment destroyed Tarleton\'s feared British Legion. Using a calculated "fighting retreat" feint to draw Tarleton\'s charge into a trap, Morgan annihilated the best British cavalry force in America in under an hour.',
    significance:
      'Cowpens was a tactical masterpiece—one of the finest double-envelopments in military history. Morgan destroyed nearly 1,100 of Cornwallis\'s best troops and stripped his army of its light infantry and cavalry screen, forcing the British commander into a desperate chase that would lead him to Yorktown.',
    didYouKnow:
      'Morgan deliberately chose a position with the Broad River at his back—a seemingly suicidal choice that prevented his militia from fleeing. He trusted that facing a river would force even the most frightened militia to stand and fight rather than run.',
    whyItMattered:
      'Cowpens was the tactical masterpiece of the Southern Campaign and is studied in military academies to this day as an example of perfect battlefield maneuver. The destruction of Tarleton\'s Legion—the terror of the Southern backcountry—electrified American morale and forced Cornwallis into the fateful "Race to the Dan" that would eventually lead his army to its destruction at Yorktown.',
    quote: 'Rise up, rise up, and fight like brave soldiers! For your wives, your children, your country!',
    quoteSource: 'Daniel Morgan, exhorting his militia before the battle',
    tags: ['Southern Campaign', 'South Carolina', 'Tactically Brilliant', 'Tarleton'],
  },

  {
    id: 'yorktown',
    name: 'Siege of Yorktown',
    date: 'October 19, 1781',
    year: 1781,
    month: 10,
    day: 19,
    coordinates: [37.2279, -76.5096],
    location: 'Yorktown, Virginia',
    outcome: 'American Victory',
    commanders: [
      { name: 'George Washington', side: 'American', rank: 'General', note: 'Supreme Allied Commander' },
      { name: 'Rochambeau', side: 'American', rank: 'Lieutenant General', note: 'French commander' },
      { name: 'Marquis de Lafayette', side: 'American', rank: 'Major General', note: 'Bottled up Cornwallis in Virginia' },
      { name: 'Charles Cornwallis', side: 'British', rank: 'Lieutenant General', note: 'Surrendered entire army' },
      { name: 'Henry Clinton', side: 'British', rank: 'General', note: 'Promised relief that never came' },
    ],
    casualties: {
      american: { killed: 75, wounded: 199 },
      british: { killed: 552, wounded: 326, captured: 8087 },
      notes: 'Allied fleet under de Grasse defeated British relief fleet at Battle of the Chesapeake',
    },
    summary:
      'Washington\'s combined American-French army, supported by the French navy, trapped Cornwallis\'s army on the Yorktown peninsula. After three weeks of siege operations, the fall of key British redoubts and a failed breakout attempt forced Cornwallis to surrender his army of 8,000 men—effectively ending the Revolutionary War.',
    significance:
      'Yorktown was the war\'s final major engagement. Cornwallis\'s surrender of the last major British field army destroyed British political will to continue fighting. Peace negotiations began almost immediately, culminating in the Treaty of Paris in 1783.',
    didYouKnow:
      'Cornwallis claimed illness and sent Brigadier General Charles O\'Hara to present his sword in his place. O\'Hara tried to surrender to Rochambeau (the French commander), seemingly to spare himself the humiliation of surrendering to colonists. Rochambeau directed him to Washington, who in turn directed him to General Benjamin Lincoln.',
    whyItMattered:
      'Yorktown was the birth of American independence in fact, not just declaration. The surrender ended large-scale military operations and broke British resolve to continue the war. News of the defeat reached London and brought down Lord North\'s government. Over the next two years, diplomats in Paris negotiated a peace treaty that recognized American independence and ceded territory to the Mississippi River—creating a nation that would grow to become the world\'s dominant power.',
    quote: 'Oh God! It is all over.',
    quoteSource: 'Lord North, British Prime Minister, upon hearing the news of Yorktown',
    tags: ['Southern Theater', 'Virginia', 'Final Victory', 'French Alliance', 'War Ending'],
  },
];

// ─── Utility Functions ─────────────────────────────────────────────────────

/** Returns battles sorted by chronological date */
export function getBattlesSorted(): Battle[] {
  return [...battles].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    if (a.month !== b.month) return a.month - b.month;
    return a.day - b.day;
  });
}

/** Returns unique years covered by the dataset */
export function getYearRange(): number[] {
  const years = [...new Set(battles.map((b) => b.year))].sort();
  return years;
}

/** All years from first to last battle, inclusive */
export function getFullYearRange(): number[] {
  const min = Math.min(...battles.map((b) => b.year));
  const max = Math.max(...battles.map((b) => b.year));
  return Array.from({ length: max - min + 1 }, (_, i) => min + i);
}
