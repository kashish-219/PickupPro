/**
 * PAGE: games  (/games  /games/create  /games/:id  /games/:id/edit)
 */
import { Games } from '../modules/api.js';
import { SPORTS, getSport, escape, formatDate, formatTime, $, $$ } from '../modules/utils.js';
import { route, render, navigate } from '../modules/router.js';
import { currentUser, requireAuth } from '../modules/auth.js';
import { toast } from '../modules/toast.js';
import { GameCard, SportSelector, setupSportSelector } from '../modules/components.js';

export function registerGamesRoutes() {

  route('/games', async () => {
    render(`
      <section class="section"><div class="container">
        <div class="page-header"><h2>🎮 All Games</h2><p>Find your perfect match</p></div>
        <div class="filters" id="sportFilters">
          <button class="filter-btn active" data-sport="">All</button>
          ${SPORTS.map(s=>`<button class="filter-btn" data-sport="${s.name}">${s.emoji} ${s.name}</button>`).join('')}
        </div>
        <div class="filter-bar">
          <div class="filter-bar__group"><label>Status</label><select id="filterStatus"><option value="upcoming">Upcoming</option><option value="completed">Completed</option><option value="">All</option></select></div>
          <div class="filter-bar__group"><label>City</label><input type="text" id="filterCity" placeholder="Any city"></div>
          <div class="filter-bar__actions"><button class="btn btn--primary" id="searchBtn">🔍 Search</button></div>
        </div>
        <div class="grid grid--games" id="gamesList"><div class="loader"><div class="loader__ball">🏀</div></div></div>
      </div></section>`);
    let sport = '';
    async function load() {
      const list = $('#gamesList');
      list.innerHTML = '<div class="loader" style="grid-column:1/-1"><div class="loader__ball">🏀</div></div>';
      try {
        const f = { sport, status: $('#filterStatus').value, city: $('#filterCity').value, limit: 20 };
        Object.keys(f).forEach(k => !f[k] && delete f[k]);
        const r = await Games.list(f);
        list.innerHTML = r.data.games.length ? r.data.games.map(GameCard).join('') : '<div class="empty-state" style="grid-column:1/-1"><div class="empty-state__icon">🔍</div><h3>No games found</h3><p>Try different filters</p></div>';
      } catch(e) { list.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><p>${e.message}</p></div>`; }
    }
    $$('.filter-btn').forEach(b => b.onclick = () => { $$('.filter-btn').forEach(x=>x.classList.remove('active')); b.classList.add('active'); sport=b.dataset.sport; load(); });
    $('#searchBtn').onclick = load;
    load();
  });

  route('/games/create', requireAuth(async () => {
    const minDate = new Date(Date.now()+3600000).toISOString().slice(0,16);
    render(`
      <section class="section"><div class="container" style="max-width:550px">
        <div class="card card--static">
          <div class="card__header card__header--primary" style="padding:var(--space-8);text-align:center">
            <div style="font-size:3rem;margin-bottom:var(--space-2)">🎮</div>
            <h2 style="color:white;margin:0">Create a Game</h2>
            <p style="color:rgba(255,255,255,0.8);margin-top:var(--space-2)">Set up a game for others to join!</p>
            <div class="card__mascot">🏀</div>
          </div>
          <div class="card__body">
            <form id="createForm">
              <div class="form-group"><label class="form-label">🏆 Sport</label>${SportSelector('radio')}</div>
              <div class="form-group"><label class="form-label">✏️ Title</label><input type="text" name="title" class="form-input" placeholder="e.g., Sunday Basketball" required></div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4)">
                <div class="form-group"><label class="form-label">📍 Location</label><input type="text" name="locationName" class="form-input" placeholder="Cabot Center" required></div>
                <div class="form-group"><label class="form-label">🏙️ City</label><input type="text" name="locationCity" class="form-input" placeholder="Boston" required></div>
              </div>
              <div class="form-group"><label class="form-label">🗺️ Address (optional)</label><input type="text" name="locationAddress" class="form-input" placeholder="123 Main St"></div>
              <div class="form-group"><label class="form-label">📅 Date & Time</label><input type="datetime-local" name="date" class="form-input" min="${minDate}" required></div>
              <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:var(--space-4)">
                <div class="form-group"><label class="form-label">👥 Min</label><input type="number" name="minPlayers" class="form-input" value="4" min="2" style="text-align:center"></div>
                <div class="form-group"><label class="form-label">👥 Max</label><input type="number" name="maxPlayers" class="form-input" value="10" min="2" style="text-align:center"></div>
                <div class="form-group"><label class="form-label">🎯 Skill</label><select name="skillLevel" class="form-select"><option>All Levels</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></div>
              </div>
              <div class="form-group"><label class="form-label">📝 Description</label><textarea name="description" class="form-textarea" placeholder="Any details..."></textarea></div>
              <div style="display:flex;gap:var(--space-4)">
                <a href="/games" class="btn btn--outline" style="flex:1" data-link>Cancel</a>
                <button type="submit" class="btn btn--primary" style="flex:2">🎮 Create!</button>
              </div>
            </form>
          </div>
        </div>
      </div></section>`);
    setupSportSelector();
    $('#createForm').onsubmit = async e => {
      e.preventDefault();
      const btn = e.target.querySelector('button[type="submit"]');
      const fd = new FormData(e.target);
      btn.disabled=true; btn.classList.add('btn--loading');
      try {
        const r = await Games.create({ sport:fd.get('sport'), title:fd.get('title'), location:{name:fd.get('locationName'),city:fd.get('locationCity'),address:fd.get('locationAddress')}, date:fd.get('date'), minPlayers:+fd.get('minPlayers'), maxPlayers:+fd.get('maxPlayers'), skillLevel:fd.get('skillLevel'), description:fd.get('description') });
        toast('success','Game created! 🎉'); navigate('/games/'+r.data._id);
      } catch(err) { toast('error',err.message); }
      finally { btn.disabled=false; btn.classList.remove('btn--loading'); }
    };
  }));

  route('/games/:id', async ({id}) => {
    const r = await Games.get(id);
    const g = r.data;
    const s = getSport(g.sport); const cls = g.sport.toLowerCase();
    const isHost = currentUser && g.hostId===currentUser._id;
    const upcoming = g.status==='upcoming' && new Date(g.date)>new Date();
    render(`
      <section class="section"><div class="container" style="max-width:850px">
        <a href="/games" class="btn btn--ghost" data-link style="margin-bottom:var(--space-4)">← Back to Games</a>
        <div class="card card--static">
          <div class="card__header card__header--${cls}" style="padding:var(--space-8);min-height:160px">
            <div style="position:relative;z-index:1">
              <div class="game-card__badge" style="margin-bottom:var(--space-3)"><span>${s.emoji}</span> ${s.name}</div>
              <h1 style="color:white;font-size:1.8rem;margin:0;text-shadow:0 2px 8px rgba(0,0,0,0.2)">${escape(g.title)}</h1>
              <p style="color:rgba(255,255,255,0.9);margin-top:var(--space-2)">${g.status==='completed'?'✅ Completed':g.status==='cancelled'?'❌ Cancelled':'🟢 Upcoming'}</p>
            </div>
            <div class="card__mascot" style="font-size:130px">${s.emoji}</div>
          </div>
          <div class="card__body">
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:var(--space-4);margin-bottom:var(--space-6)">
              <div class="game-card__info-row"><div class="game-card__info-icon" style="width:48px;height:48px;font-size:1.3rem">📍</div><div><strong>${escape(g.location.name)}</strong><br><span style="color:var(--gray-500);font-size:0.85rem">${escape(g.location.address||g.location.city)}</span></div></div>
              <div class="game-card__info-row"><div class="game-card__info-icon" style="width:48px;height:48px;font-size:1.3rem">📅</div><div><strong>${formatDate(g.date)}</strong><br><span style="color:var(--gray-500);font-size:0.85rem">${formatTime(g.date)}</span></div></div>
              <div class="game-card__info-row"><div class="game-card__info-icon" style="width:48px;height:48px;font-size:1.3rem">👥</div><div><strong>${g.playerCount}/${g.maxPlayers} Players</strong><br><span style="color:var(--gray-500);font-size:0.85rem">${g.spotsAvailable} spots left</span></div></div>
              <div class="game-card__info-row"><div class="game-card__info-icon" style="width:48px;height:48px;font-size:1.3rem">🎯</div><div><strong>${g.skillLevel||'All Levels'}</strong><br><span style="color:var(--gray-500);font-size:0.85rem">Skill Level</span></div></div>
            </div>
            ${g.description?`<div style="padding:var(--space-4);background:var(--gray-50);border-radius:var(--radius-xl);margin-bottom:var(--space-6)"><p style="color:var(--gray-600);margin:0">${escape(g.description)}</p></div>`:''}
            <div style="margin-bottom:var(--space-6)">
              <h3 style="font-size:1.1rem;margin-bottom:var(--space-4)">🎖️ Host</h3>
              <a href="/users/${g.host._id}" data-link style="display:flex;align-items:center;gap:var(--space-4);padding:var(--space-4);background:linear-gradient(135deg,rgba(99,102,241,0.1),rgba(139,92,246,0.1));border-radius:var(--radius-xl);text-decoration:none;border:2px solid transparent;transition:var(--transition)">
                <div style="width:56px;height:56px;background:var(--primary-gradient);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.5rem">👤</div>
                <div style="flex:1"><div style="font-weight:700">${escape(g.host.name)}</div><div>⭐ ${(g.host.rating?.avgRating||0).toFixed(1)} (${g.host.rating?.totalRatings||0} reviews)</div></div>
                <div style="color:var(--primary);font-size:0.85rem;font-weight:600">View →</div>
              </a>
            </div>
            <div style="margin-bottom:var(--space-6)">
              <h3 style="font-size:1.1rem;margin-bottom:var(--space-4)">👥 Players (${g.playerCount}/${g.maxPlayers})</h3>
              ${g.players.length>0
                ?`<div style="display:flex;flex-direction:column;gap:var(--space-3)">${g.players.map((p,i)=>`<a href="/users/${p._id}" data-link style="display:flex;align-items:center;gap:var(--space-4);padding:var(--space-4);background:var(--gray-50);border-radius:var(--radius-xl);text-decoration:none;border:2px solid transparent;transition:var(--transition)"><div style="width:12px;font-weight:700;color:var(--gray-400)">${i+1}</div><div style="width:44px;height:44px;background:var(--primary-gradient);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.2rem">👤</div><div style="flex:1"><div style="font-weight:600">${escape(p.name)}</div><div style="font-size:0.85rem;color:var(--gray-600)">⭐ ${(p.rating?.avgRating||0).toFixed(1)}</div></div></a>`).join('')}</div>`
                :`<div style="padding:var(--space-6);background:var(--gray-50);border-radius:var(--radius-xl);text-align:center"><p style="color:var(--gray-500);margin:0">No players yet. Be the first!</p></div>`}
            </div>
            ${g.waitlist&&g.waitlist.length>0?`<div style="margin-bottom:var(--space-6)"><h3 style="font-size:1.1rem;margin-bottom:var(--space-4)">⏳ Waitlist (${g.waitlistCount})</h3><div style="display:flex;flex-direction:column;gap:var(--space-3)">${g.waitlist.map((p,i)=>`<a href="/users/${p._id}" data-link style="display:flex;align-items:center;gap:var(--space-4);padding:var(--space-4);background:#FEF3C7;border-radius:var(--radius-xl);text-decoration:none;border:2px solid transparent;transition:var(--transition)"><div style="width:24px;height:24px;background:var(--warning);color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700">${i+1}</div><div style="flex:1"><div style="font-weight:600">${escape(p.name)}</div></div></a>`).join('')}</div></div>`:''}
            <div style="display:flex;flex-wrap:wrap;gap:var(--space-3);padding-top:var(--space-4);border-top:2px dashed var(--gray-200)">
              ${upcoming?(isHost?`<a href="/games/${g._id}/edit" class="btn btn--outline" data-link>✏️ Edit</a><button class="btn btn--success" id="completeBtn">✅ Complete</button><button class="btn btn--danger" id="cancelBtn">❌ Cancel</button>`:g.isPlayer?`<button class="btn btn--outline" id="leaveBtn">👋 Leave</button>`:g.isWaitlisted?`<button class="btn btn--outline" id="leaveBtn">Leave Waitlist</button><span style="padding:var(--space-3) var(--space-4);background:#FEF3C7;border-radius:var(--radius-lg);font-weight:600">⏳ #${g.waitlistPosition}</span>`:currentUser?`<button class="btn btn--primary btn--lg" id="joinBtn">${g.isFull?'📝 Join Waitlist':'🎮 Join Game'}</button>`:`<a href="/login" class="btn btn--primary btn--lg" data-link>🔐 Login to Join</a>`):''}
              ${g.status==='completed'&&(isHost||g.isPlayer)?`<a href="/ratings/pending" class="btn btn--primary" data-link>⭐ Rate Players</a>`:''}
            </div>
          </div>
        </div>
      </div></section>`);
    const joinBtn=$('#joinBtn'),leaveBtn=$('#leaveBtn'),completeBtn=$('#completeBtn'),cancelBtn=$('#cancelBtn');
    if(joinBtn) joinBtn.onclick=async()=>{joinBtn.disabled=true;joinBtn.classList.add('btn--loading');try{const res=await Games.join(g._id);toast('success',res.message||'Joined! 🎉');navigate('/games/'+g._id);}catch(e){toast('error',e.message);joinBtn.disabled=false;joinBtn.classList.remove('btn--loading');}};
    if(leaveBtn) leaveBtn.onclick=async()=>{if(!confirm('Leave?'))return;leaveBtn.disabled=true;try{await Games.leave(g._id);toast('success','Left');navigate('/games/'+g._id);}catch(e){toast('error',e.message);}};
    if(completeBtn) completeBtn.onclick=async()=>{if(!confirm('Mark complete?'))return;try{await Games.complete(g._id);toast('success','Done! ⭐');navigate('/games/'+g._id);}catch(e){toast('error',e.message);}};
    if(cancelBtn) cancelBtn.onclick=async()=>{if(!confirm('Cancel game?'))return;try{await Games.delete(g._id);toast('success','Cancelled');navigate('/games');}catch(e){toast('error',e.message);}};
  });

  route('/games/:id/edit', requireAuth(async ({id}) => {
    const r = await Games.get(id);
    const g = r.data;
    if(g.hostId!==currentUser._id){toast('error','Not authorized');navigate('/games/'+id);return;}
    const dv=new Date(g.date);dv.setMinutes(dv.getMinutes()-dv.getTimezoneOffset());
    render(`
      <section class="section"><div class="container" style="max-width:550px">
        <div class="card card--static">
          <div class="card__header card__header--${g.sport.toLowerCase()}" style="padding:var(--space-6);text-align:center">
            <h2 style="color:white;margin:0">✏️ Edit Game</h2>
            <div class="card__mascot" style="font-size:80px">${getSport(g.sport).emoji}</div>
          </div>
          <div class="card__body">
            <form id="editForm">
              <div class="form-group"><label class="form-label">🏆 Sport</label><div class="sport-grid">${SPORTS.map(s=>`<label class="sport-item ${s.name===g.sport?'active':''}"><input type="radio" name="sport" value="${s.name}" ${s.name===g.sport?'checked':''} required><span class="sport-item__emoji">${s.emoji}</span><span class="sport-item__name">${s.name}</span></label>`).join('')}</div></div>
              <div class="form-group"><label class="form-label">✏️ Title</label><input type="text" name="title" class="form-input" value="${escape(g.title)}" required></div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4)">
                <div class="form-group"><label class="form-label">📍 Location</label><input type="text" name="locationName" class="form-input" value="${escape(g.location.name)}" required></div>
                <div class="form-group"><label class="form-label">🏙️ City</label><input type="text" name="locationCity" class="form-input" value="${escape(g.location.city)}" required></div>
              </div>
              <div class="form-group"><label class="form-label">🗺️ Address</label><input type="text" name="locationAddress" class="form-input" value="${escape(g.location.address||'')}"></div>
              <div class="form-group"><label class="form-label">📅 Date & Time</label><input type="datetime-local" name="date" class="form-input" value="${dv.toISOString().slice(0,16)}" required></div>
              <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:var(--space-4)">
                <div class="form-group"><label class="form-label">👥 Min</label><input type="number" name="minPlayers" class="form-input" value="${g.minPlayers}" min="2" style="text-align:center"></div>
                <div class="form-group"><label class="form-label">👥 Max</label><input type="number" name="maxPlayers" class="form-input" value="${g.maxPlayers}" min="${g.playerCount}" style="text-align:center"></div>
                <div class="form-group"><label class="form-label">🎯 Skill</label><select name="skillLevel" class="form-select"><option ${g.skillLevel==='All Levels'?'selected':''}>All Levels</option><option ${g.skillLevel==='Beginner'?'selected':''}>Beginner</option><option ${g.skillLevel==='Intermediate'?'selected':''}>Intermediate</option><option ${g.skillLevel==='Advanced'?'selected':''}>Advanced</option></select></div>
              </div>
              <div class="form-group"><label class="form-label">📝 Description</label><textarea name="description" class="form-textarea">${escape(g.description||'')}</textarea></div>
              <div style="display:flex;gap:var(--space-4)">
                <a href="/games/${g._id}" class="btn btn--outline" style="flex:1" data-link>Cancel</a>
                <button type="submit" class="btn btn--primary" style="flex:2">💾 Save</button>
              </div>
            </form>
          </div>
        </div>
      </div></section>`);
    setupSportSelector();
    $('#editForm').onsubmit=async e=>{
      e.preventDefault();
      const btn=e.target.querySelector('button[type="submit"]');const fd=new FormData(e.target);
      btn.disabled=true;btn.classList.add('btn--loading');
      try{await Games.update(id,{sport:fd.get('sport'),title:fd.get('title'),location:{name:fd.get('locationName'),city:fd.get('locationCity'),address:fd.get('locationAddress')},date:fd.get('date'),minPlayers:+fd.get('minPlayers'),maxPlayers:+fd.get('maxPlayers'),skillLevel:fd.get('skillLevel'),description:fd.get('description')});toast('success','Saved! ✅');navigate('/games/'+id);}
      catch(err){toast('error',err.message);}
      finally{btn.disabled=false;btn.classList.remove('btn--loading');}
    };
  }));
}
