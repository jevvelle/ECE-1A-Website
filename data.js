// EDIT THIS FILE to update class data. Times are 24h "HH:MM". day: 0=Sun ... 6=Sat.
const F=(n,d)=>`<span class="f"><i>${n}</i><b>${d}</b></span>`; // stacked fraction helper

const CONFIG={
 secretaryPin:"1234"                               // Secretary's Kiosk PIN, change it
};

// R = Regular, B = Schedule B, C = Schedule C (Regular minus ECE 102)
const PRESETS={R:{name:"Regular",units:29},B:{name:"Schedule B",units:18},C:{name:"Schedule C",units:26}};

const SUBJECTS=[
 {id:"STS101",code:"STS 101",title:"Science, Technology and Society",prof:"Prof. Dan Carlo dela Vega"},
 {id:"AE101",code:"AE 101",title:"Academic English",prof:"Prof. Florentino Pineda"},
 {id:"PE11",code:"PE 11",title:"PATHFit 2",prof:"Prof. Bryan Joseph N. Bautista"},
 {id:"ECE102",code:"ECE 102",title:"Materials Science and Engineering",prof:"Prof. Amor A. Lacara"},
 {id:"ECE103",code:"ECE 103",title:"Physics 2",prof:"Prof. Rina S. Santiago"},
 {id:"ECE103L",code:"ECE 103L",title:"Physics 2 Laboratory",prof:"Prof. Rina S. Santiago"},
 {id:"COE104",code:"COE 104",title:"Calculus 2",prof:"Prof. Raevinor Gonzales"},
 {id:"COE105",code:"COE 105",title:"Physics for Engineers (Lecture)",prof:"Prof. Rodelio Antonio Jr."},
 {id:"COE105L",code:"COE 105L",title:"Physics for Engineers (Laboratory)",prof:"Prof. Rodelio Antonio Jr."},
 {id:"TCW101",code:"TCW 101",title:"The Contemporary World",prof:"Prof. J. Gabriel"},
 {id:"NSTP11",code:"NSTP 11",title:"National Service Training Program 2",prof:"Prof. Eljay Campita"},
 {id:"ECE101L",code:"ECE 101L",title:"Computer-Aided Design",prof:"Prof. Ronel Serrano"}
];

// s = schedules that include the slot: "RBC" means Regular, B and C. Room "TBA" = not shown on the timetable.
const SLOTS=[
 {sub:"STS101",s:"RBC",day:1,start:"17:00",end:"18:30",room:"COE 2-506"},
 {sub:"STS101",s:"RBC",day:5,start:"15:30",end:"17:00",room:"COE 2-506"},
 {sub:"AE101",s:"RBC",day:1,start:"10:00",end:"13:00",room:"NH-406"},
 {sub:"PE11",s:"RBC",day:1,start:"14:00",end:"16:00",room:"Student Lounge"},
 {sub:"ECE102",s:"RB",day:2,start:"07:00",end:"08:30",room:"COE 2-405"},
 {sub:"ECE102",s:"RB",day:5,start:"18:30",end:"20:00",room:"COE 2-405"},
 {sub:"ECE103",s:"RC",day:2,start:"08:30",end:"10:00",room:"COE 2-203"},
 {sub:"ECE103",s:"RC",day:5,start:"17:00",end:"18:30",room:"COE 2-203"},
 {sub:"ECE103L",s:"RC",day:1,start:"07:00",end:"10:00",room:"COE 2-207A"},
 {sub:"ECE103L",s:"RC",day:3,start:"07:00",end:"10:00",room:"COE 2-207A"},
 {sub:"COE104",s:"RC",day:2,start:"10:00",end:"13:00",room:"NH-406"},
 {sub:"COE105",s:"RC",day:4,start:"10:00",end:"13:00",room:"NH-406"},
 {sub:"COE105L",s:"RC",day:2,start:"17:00",end:"20:00",room:"NH-503"},
 {sub:"COE105L",s:"RC",day:4,start:"07:00",end:"10:00",room:"NH-501"},
 {sub:"TCW101",s:"RBC",day:3,start:"10:00",end:"13:00",room:"NH-406"},
 {sub:"NSTP11",s:"RBC",day:4,start:"14:00",end:"17:00",room:"NH-406"},
 {sub:"ECE101L",s:"RBC",day:6,start:"07:00",end:"10:00",room:"NH-401"},
 {sub:"ECE101L",s:"RBC",day:6,start:"10:00",end:"13:00",room:"NH-401"}
];

// Class tasks. sub is a subject id, or "all" for the whole class. type: "task" | "quiz" | "exam" | "lab" (quiz, exam and lab feed the countdown).
// due is local time YYYY-MM-DDTHH:MM (leave it out if there is no deadline yet). note is optional small text under the title (links become "Open link").
const TASKS=[
 {id:"n1",sub:"all",type:"task",title:"Bring your signed COR",due:"2026-11-23T08:00",note:"Still unsigned? You may bring it next week."},
 {id:"n2",sub:"TCW101",type:"task",title:"Pay ₱5 for the TCW index card",due:"2026-11-27T17:00",note:"Pay Hussein. Collection runs from Sat Nov 21 until next week."},
 {id:"n3",sub:"PE11",type:"task",title:"Pay ₱10 for the PATHFit activity card",due:"2026-11-27T17:00",note:"Collection runs from Sat Nov 21 until next week. Activity TBA."},
 {id:"n4",sub:"COE105",type:"task",title:"Make a white index card (1/8)",due:"2026-11-26T10:00",note:"1x1 photo upper right, name (surname first), year and section, MFE grade upper left."},
 {id:"n5",sub:"COE105",type:"task",title:"Print declaration form, bring protractor, ruler, pencil",due:"2026-11-26T10:00"},
 {id:"n6",sub:"COE105L",type:"task",title:"Bring a green ballpen (0.3 to 0.4) for lab reports",due:"2026-11-24T17:00"},
 {id:"n7",sub:"NSTP11",type:"quiz",title:"Quiz expected: NSTP Primer",due:"2026-11-26T14:00",note:"Next week or the week after."},
 {id:"n8",sub:"NSTP11",type:"task",title:"Prepare a triangular bandage and mouth guard",due:"2026-12-03T14:00",note:"Bandage size: 40x40x58 inches."},
 {id:"n9",sub:"STS101",type:"task",title:"Review orientation slides, read ahead",due:"2026-11-23T17:00",note:"Next topic: definition, kinds and types of science, technology and society."},
 {id:"n10",sub:"STS101",type:"task",title:"Join the STS Microsoft Teams",due:"2026-11-23T17:00",note:"Class code: qkyruu3"},
 {id:"n11",sub:"STS101",type:"task",title:"Register on PLUS BANK",due:"2026-11-23T17:00",note:"For recitation, attendance and plus points: https://plus-bank-supabase-test.sirdancarlodelavega.workers.dev/"},
 {id:"n12",sub:"ECE103L",type:"lab",title:"Experiments 1 and 2 (Physics 2)",note:"No deadline yet. Yellow plastic envelope, one per group."},
 {id:"n13",sub:"ECE102",type:"task",title:"No MSE class on Tuesday",due:"2026-11-24T07:00"},
 {id:"n14",sub:"COE104",type:"task",title:"Calculus 2 Assignment #1",due:"2026-12-03T23:59"},
 {id:"n15",sub:"COE104",type:"task",title:"Calculus 2 index card of formulas",due:"2026-12-01T23:59"},
 {id:"n16",sub:"ECE103",type:"task",title:"Physics 2 Activity 1: Electricity",note:"No deadline yet."},
 {id:"n17",sub:"COE105L",type:"lab",title:"Physics for Engineers: Lab Activity 1",due:"2026-12-05T23:59"},
 {id:"n18",sub:"NSTP11",type:"task",title:"NSTP Narrative Report",due:"2026-12-10T23:59"},
 {id:"n19",sub:"STS101",type:"task",title:"STS Vlog (Performance Task 1)",due:"2026-12-11T23:59"}
];

// CLASS LIST: "id|Surname, First". The id is the list position. Do NOT put real student numbers here, this file is public.
const MASTER=`001|Abelardo, Chariz L.
002|Abiera, Shandreah Fatima M.
003|Adina, Akiesha Evolet V.
004|Alfonso, Mark Lawrence M.
005|Amantiad, Princess Erika F.
006|Antonio, Leander R.
007|Belolo, Jude Evan L.
008|Borro, James Harold D.
009|Buco, Leenea Anne G.
010|Clemente, Justine Yael P.
011|Concepcion, Jay-R Y.
012|Constantino, Edward Ken Shinta S.
013|Cruz, Jeremy C.
014|Cruz, Liah Krish Rhianne Q.
015|Cutanda, Vhinz Franscois L.
016|De Jesus, Hussein C.
017|De Leon, Nap Jenard L.
018|Fabella, Serafin James C.
019|Fadirugao, Earl Lawrence M.
020|Faustino, Ishia Beatrice B.
021|Faustino, Ray Francis A.
022|Francisco, Ryzer James S.J.
023|Gabriel, Stephanie Marion S.
024|Gallardo, Syeesha Q.
025|Garcia, Dean Klein A.
026|Garcia, Shanika Ashley C.
027|Guevarra, Shann Rouisse L.
028|Gutierrez, Jade S.
029|Guzman, Jorimuel C.
030|Ison, John Benedict S.
031|Liberato, Anry Dag-ay
032|Lobedica, Jose Allen R.
033|Lumague, Jireh P.
034|Martinez, Ysabella Dianne C.
035|Medina, Pouline Anne L.
036|Mendoza, Vincent Gio
037|Mendoza, Xia D.
038|Mercado, Yvan Dor G.
039|Metiam, Kyshaun Z.
040|Norona, Ruel Juro
041|Pagdanganan, France Avien Scierell I.
042|Parole, Jaime S.
043|Pulumbarit, Pierre Gabriel M.
044|Rafa, Jewelle Riyanne N.
045|Reyes, Gerald M.
046|Reyes, Jessy Maiah S.
047|Ronda, Ephraim James R.
048|Santos, Dan Loreine D.
049|Santos, Nicholas Gabriel L.
050|Sero, Leonor D.
051|Tuazon, Aleckos James A.
052|Urbano, Jam Miel F.
053|Usi, Alicia Margarette A.
054|Vicente, Don Zyrus`.split('\n').map(l=>{const[no,n]=l.split('|');return{no,n}});

// Students who are NOT in the regular block (they attend only STS, AE, PE, TCW, NSTP)
const NOT_REG=["009","011","013","014","019","023","026","028","032","034","037","042","045","047","051","052","053"];
// Students who are NOT enrolled in ECE 102 (Materials Science)
const NOT_MAT=["004","013","029","032","045"];
const REG_SUBJECTS=["ECE101L","ECE103","ECE103L","COE104","COE105","COE105L"]; // regular-only subjects

// Who attends a subject: ECE 102 has its own list, ECE/COE subjects use the regular block, the rest use the whole class.
const enrolled=sub=>MASTER.filter(r=>sub==="ECE102"?!NOT_MAT.includes(r.no):REG_SUBJECTS.includes(sub)?!NOT_REG.includes(r.no):true);

// GROUPS: shown in the Class tab, per subject. Names are plain text ("Surname, Given"), edit freely.
const GROUPS={
 ECE102:[["Antonio, Janella", "Bernardo, Jamine", "Borro, James Harold D.", "De Guzman, Zara", "Delos Santos, Trisha", "Faustino, Marc Julius", "Flores, Rhizzalyn", "Liberato, Anry Dag-ay", "Norona, Ruel Juro", "Ocampo, Jamil Lenard"], ["Amantiad, Princess Erika F.", "Constantino, Edward Ken Shinta S.", "Cutanda, Vhinz Franscois L.", "De Jesus, Hussein C.", "Fabella, Serafin James C.", "Francisco, Ryzer James S.J.", "Garcia, Dean Klein A.", "Guevarra, Shann Rouisse L.", "Metiam, Kyshaun Z.", "Pulumbarit, Pierre Gabriel M.", "Reyes, Jessy Maiah S."], ["Buco, Leenea Anne G.", "Clemente, Justine Yael P.", "Cruz, Liah Krish Rhianne Q.", "Faustino, Ishia Beatrice B.", "Gabriel, Stephanie Marion S.", "Gallardo, Syeesha Q.", "Martinez, Ysabella Dianne C.", "Mendoza, Xia D.", "Rafa, Jewelle Riyanne N.", "Santos, Dan Loreine D.", "Vicente, Don Zyrus"], ["Abelardo, Chariz L.", "Belolo, Jude Evan L.", "Concepcion, Jay-R Y.", "Garcia, Shanika Ashley C.", "Gutierrez, Jade S.", "Ison, John Benedict S.", "Parole, Jaime S.", "Ronda, Ephraim James R.", "Santos, Nicholas Gabriel L.", "Tuazon, Aleckos James A.", "Urbano, Jam Miel F.", "Usi, Alicia Margarette A."], ["Abiera, Shandreah Fatima M.", "Adina, Akiesha Evolet V.", "Antonio, Leander R.", "De Leon, Nap Jenard L.", "Fadirugao, Earl Lawrence M.", "Faustino, Ray Francis A.", "Lumague, Jireh P.", "Medina, Pouline Anne L.", "Mendoza, Vincent Gio", "Mercado, Yvan Dor G.", "Pagdanganan, France Avien Scierell I.", "Sero, Leonor D."]],
 NSTP11:[["Amantiad, Princess Erika F.", "Borro, James Harold D.", "Clemente, Justine Yael P.", "Constantino, Edward Ken Shinta S.", "Gabriel, Stephanie Marion S.", "Garcia, Shanika Ashley C.", "Ison, John Benedict S.", "Mercado, Yvan Dor G.", "Metiam, Kyshaun Z.", "Parole, Jaime S.", "Rafa, Jewelle Riyanne N."], ["Abelardo, Chariz L.", "Antonio, Leander R.", "Buco, Leenea Anne G.", "Cruz, Liah Krish Rhianne Q.", "Cutanda, Vhinz Franscois L.", "De Leon, Nap Jenard L.", "Mendoza, Vincent Gio", "Reyes, Gerald M.", "Tuazon, Aleckos James A.", "Usi, Alicia Margarette A."], ["Belolo, Jude Evan L.", "De Jesus, Hussein C.", "Faustino, Ray Francis A.", "Gutierrez, Jade S.", "Lobedica, Jose Allen R.", "Martinez, Ysabella Dianne C.", "Pagdanganan, France Avien Scierell I.", "Santos, Dan Loreine D.", "Urbano, Jam Miel F.", "Medina, Pouline Anne L."], ["Cruz, Jeremy C.", "Francisco, Ryzer James S.J.", "Garcia, Dean Klein A.", "Lumague, Jireh P.", "Mendoza, Xia D.", "Pulumbarit, Pierre Gabriel M.", "Reyes, Jessy Maiah S.", "Ronda, Ephraim James R.", "Santos, Nicholas Gabriel L.", "Sero, Leonor D."], ["Abiera, Shandreah Fatima M.", "Adina, Akiesha Evolet V.", "Alfonso, Mark Lawrence M.", "Concepcion, Jay-R Y.", "Fabella, Serafin James C.", "Fadirugao, Earl Lawrence M.", "Faustino, Ishia Beatrice B.", "Guevarra, Shann Rouisse L.", "Liberato, Anry Dag-ay", "Quizon, Syeesha", "Vicente, Don Zyrus"]],
 ECE103L:[["Abelardo, Chariz L.", "Alfonso, Mark Lawrence M.", "Antonio, Leander R.", "Belolo, Jude Evan L.", "Borro, James Harold D.", "Clemente, Justine Yael P.", "Constantino, Edward Ken Shinta S.", "Faustino, Ishia Beatrice B.", "Gallardo, Syeesha Q.", "Guevarra, Shann Rouisse L.", "Ison, John Benedict S.", "Liberato, Anry Dag-ay", "Norona, Ruel Juro", "Rafa, Jewelle Riyanne N.", "Reyes, Jessy Maiah S.", "Santos, Dan Loreine D.", "Santos, Nicholas Gabriel L.", "Vicente, Don Zyrus", "Sero, Leonor D."], ["Abiera, Shandreah Fatima M.", "Adina, Akiesha Evolet V.", "Amantiad, Princess Erika F.", "Cutanda, Vhinz Franscois L.", "De Jesus, Hussein C.", "De Leon, Nap Jenard L.", "Fabella, Serafin James C.", "Faustino, Ray Francis A.", "Francisco, Ryzer James S.J.", "Garcia, Dean Klein A.", "Guzman, Jorimuel C.", "Lumague, Jireh P.", "Medina, Pouline Anne L.", "Mendoza, Vincent Gio", "Mercado, Yvan Dor G.", "Metiam, Kyshaun Z.", "Pagdanganan, France Avien Scierell I.", "Pulumbarit, Pierre Gabriel M."]],
 ECE101L:[["Abelardo, Chariz L.", "Alfonso, Mark Lawrence M.", "Belolo, Jude Evan L.", "Borro, James Harold D.", "Buco, Leenea Anne G.", "Clemente, Justine Yael P.", "Concepcion, Jay-R Y.", "Cruz, Jeremy C.", "Cruz, Liah Krish Rhianne Q.", "Fadirugao, Earl Lawrence M.", "Faustino, Ishia Beatrice B.", "Gabriel, Stephanie Marion S.", "Gallardo, Syeesha Q.", "Garcia, Shanika Ashley C.", "Gutierrez, Jade S.", "Liberato, Anry Dag-ay", "Lobedica, Jose Allen R.", "Martinez, Ysabella Dianne C.", "Mendoza, Xia D.", "Parole, Jaime S.", "Rafa, Jewelle Riyanne N.", "Reyes, Gerald M.", "Ronda, Ephraim James R.", "Santos, Dan Loreine D.", "Tuazon, Aleckos James A.", "Urbano, Jam Miel F.", "Usi, Alicia Margarette A."], ["Abiera, Shandreah Fatima M.", "Adina, Akiesha Evolet V.", "Amantiad, Princess Erika F.", "Antonio, Leander R.", "Constantino, Edward Ken Shinta S.", "Cutanda, Vhinz Franscois L.", "De Jesus, Hussein C.", "De Leon, Nap Jenard L.", "Fabella, Serafin James C.", "Faustino, Ray Francis A.", "Francisco, Ryzer James S.J.", "Garcia, Dean Klein A.", "Guevarra, Shann Rouisse L.", "Guzman, Jorimuel C.", "Ison, John Benedict S.", "Lumague, Jireh P.", "Medina, Pouline Anne L.", "Mendoza, Vincent Gio", "Mercado, Yvan Dor G.", "Metiam, Kyshaun Z.", "Norona, Ruel Juro", "Pagdanganan, France Avien Scierell I.", "Pulumbarit, Pierre Gabriel M.", "Reyes, Jessy Maiah S.", "Santos, Nicholas Gabriel L.", "Sero, Leonor D.", "Vicente, Don Zyrus"]]
};

// VAULT: add your reviewer cards here. period = "Quiz" | "Midterms" | "Finals". body is HTML (use F("top","bottom") for stacked fractions). link is optional.
// Example: {sub:"COE104",period:"Quiz",title:"Quiz 1 formulas",body:`<div class="fm">A = ${F("b h","2")}</div>`,link:""}
const VAULT=[];