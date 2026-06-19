import{g as o}from"./text.BSXC2C5r.js";const t=document.getElementById("source-text"),r=document.getElementById("stats-grid"),n=document.getElementById("status"),d=document.getElementById("copy-text"),i=document.getElementById("clear-all"),l={characters:"Characters",words:"Words",lines:"Lines",sentences:"Sentences",paragraphs:"Paragraphs",readingMinutes:"Reading minutes"};function e(){const s=o(t.value);r.innerHTML=Object.entries(s).map(([a,c])=>`
        <div class="stat">
          <strong>${c}</strong>
          <span>${l[a]}</span>
        </div>
      `).join("")}t.addEventListener("input",e);i.addEventListener("click",()=>{t.value="",e(),t.focus()});d.addEventListener("click",async()=>{await navigator.clipboard.writeText(t.value),n.textContent="Copied",window.setTimeout(()=>n.textContent="Ready",1200)});e();
