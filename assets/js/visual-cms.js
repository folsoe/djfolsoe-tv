const API='https://djfolsoe-tv-api.sunefolsoe.workers.dev';
const $=id=>document.getElementById(id);
let state=null,currentModuleFilter='all',draggedModuleId='',pendingConfirm=null;
const SCENE_COMPOSER_KEY='djf_scene_composer_v1400';
let wizardState={type:'',step:0,module:null};
const themeColors={weekend:'#55e5ff',trance:'#4ce8ff',fredagsbar:'#72ffb7',eurodance:'#ff35b8',retro:'#ffd063',popup:'#ff496f',morning:'#ffd96a',summer:'#61efff',danske:'#ff5454',top20:'#8066ff'};
const typeIcons={poster:'▣','ranked-list':'10',story:'✎',poll:'✓',playlist:'♫','news-feed':'▤',text:'T',video:'▶',embed:'<>','now-playing':'♫'};
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const token=()=>localStorage.getItem('djf_cms_token')||$('adminToken').value.trim();
function headers(){return {'Content-Type':'application/json','X-Admin-Token':token()}}
async function api(path,options={}){let response;try{response=await fetch(API+path,{cache:'no-store',...options,headers:{...headers(),...(options.headers||{})}})}catch(error){const e=new Error('network-unreachable');e.cause=error;throw e}let data={};try{data=await response.json()}catch(_){data={ok:false,error:'invalid-server-response'}}if(!response.ok||data.ok===false){const e=new Error(data.message||data.error||`request-failed-${response.status}`);e.status=response.status;e.payload=data;throw e}return data}
function friendlyError(error){
  const code=String(error?.payload?.error||error?.message||'unknown-error').toLowerCase();
  const status=Number(error?.status||0);
  if(code.includes('unauthorized')||status===401)return{title:'The password does not match',message:'Use the value stored in the Cloudflare secret named ADMIN_TOKEN.',details:['Worker route is available','Your Twitch tokens do not need to change']};
  if(code.includes('not found')||code.includes('route-not-found')||status===404)return{title:'The CMS route is missing',message:'Deploy the complete V1002.2 Worker. Uploading the admin page alone cannot create Worker routes.',details:[error?.payload?.path||'/api/cms/admin/state','Expected Worker: V1002.2']};
  if(code.includes('kv put')||code.includes('limit exceeded'))return{title:'Cloudflare KV write limit reached',message:'Loading remains read-only. Saving and publishing must wait until the KV allowance resets.',details:['No password change is required','The CMS can still inspect existing content']};
  if(code.includes('network-unreachable')||code.includes('failed to fetch'))return{title:'The Worker cannot be reached',message:'Check the internet connection, Worker address and Cloudflare deployment.',details:[API]};
  if(code.includes('invalid-server-response'))return{title:'The Worker returned an unreadable response',message:'The deployed Worker may be incomplete or contain a runtime error.',details:['Open /api/cms/health to verify the build']};
  return{title:'The control room could not connect',message:error?.payload?.message||error?.message||'Unknown connection error.',details:[`HTTP ${status||'—'}`,code]};
}
function showConnectionPanel(info,success=false){
  const panel=$('connectionPanel');if(!panel)return;
  panel.hidden=false;panel.classList.toggle('success',success);
  $('connectionPanelIcon').textContent=success?'✓':'!';
  $('connectionPanelKicker').textContent=success?'CONNECTION READY':'CONNECTION CHECK';
  $('connectionPanelTitle').textContent=info.title;
  $('connectionPanelMessage').textContent=info.message;
  $('connectionPanelDetails').innerHTML=(info.details||[]).filter(Boolean).map(x=>`<span>${esc(x)}</span>`).join('');
}
function hideConnectionPanel(){const panel=$('connectionPanel');if(panel)panel.hidden=true}
async function preflight(){
  const node=$('preflightStatus');
  if(node){node.className='preflightStatus';node.querySelector('strong').textContent='Checking Worker…'}
  try{
    const health=await api('/api/cms/health',{headers:{'X-Admin-Token':''}});
    if(node){node.classList.add('ok');node.querySelector('strong').textContent=`${health.version} · CMS routes ready`}
    return health;
  }catch(error){
    if(node){node.classList.add('error');node.querySelector('strong').textContent='Worker check failed'}
    showConnectionPanel(friendlyError(error));
    return null;
  }
}
function toast(message,error=false){const node=$('toast');node.textContent=message;node.className='toast'+(error?' error':'');void node.offsetWidth;node.classList.add('show')}
function formatDate(value){if(!value)return'';const d=new Date(value);return Number.isNaN(d.getTime())?'':d.toLocaleString('en-GB',{dateStyle:'medium',timeStyle:'short'})}
function toLocalInput(value){if(!value)return'';const d=new Date(value);if(Number.isNaN(d.getTime()))return'';const local=new Date(d.getTime()-d.getTimezoneOffset()*60000);return local.toISOString().slice(0,16)}
function activeThemes(){return state?.themes||[]}
function themeOptions(selected='all',includeAll=true){return `${includeAll?`<option value="all" ${selected==='all'?'selected':''}>All themes</option>`:''}${activeThemes().map(t=>`<option value="${esc(t.id)}" ${selected===t.id?'selected':''}>${esc(t.title)}</option>`).join('')}`}
function showOptions(selected='all'){const shows=state?.core?.featuredShows||[];return `<option value="all">All shows</option>${shows.map(s=>{const id=(s.id||s.title||'').toLowerCase().replace(/\s+/g,'-');return `<option value="${esc(id)}" ${selected===id?'selected':''}>${esc(s.title)}</option>`}).join('')}`}

function openWizard(type=''){
  wizardState={type:type||'',step:type?1:0,module:null};
  $('createWizard').hidden=false;
  renderWizardStep();
}
function closeWizard(){
  $('createWizard').hidden=true;
  wizardState={type:'',step:0,module:null};
}
function renderWizardStep(){
  document.querySelectorAll('.wizardStep').forEach((node,index)=>node.classList.toggle('active',index===wizardState.step));
  if(wizardState.step===1){
    $('wizardTitle').textContent=`Create ${wizardState.type.replace('-',' ')}`;
    $('wizardFields').innerHTML=wizardFields(wizardState.type);
    bindWizardDynamicFields();
  }
  if(wizardState.step===2){
    $('wizardTheme').innerHTML=themeOptions('all');
    $('wizardShow').innerHTML=showOptions('all');
  }
}
function wizardFields(type){
  const titleAndText=`<div class="wizardFieldsPanel"><h3>Tell visitors what this is about</h3><label>Title<input id="wizardContentTitle" placeholder="Write a clear title"></label><label>Short introduction<textarea id="wizardContentDescription" placeholder="Explain it in one or two sentences"></textarea></label></div>`;
  const media=`<div class="wizardFieldsPanel"><h3>Image</h3><div class="wizardMediaRow"><label class="wizardImageDrop"><span>Click or drop image</span><img id="wizardImagePreview" hidden><input id="wizardImageFile" type="file" accept="image/*"></label><div><label>Or paste an image address<input id="wizardImageUrl" placeholder="https://..."></label><p class="note">Direct upload requires the Cloudflare R2 binding DJF_MEDIA.</p></div></div></div>`;
  if(type==='poster')return titleAndText+media+`<div class="wizardFieldsPanel"><h3>Event details</h3><div class="twoCols"><label>Date or label<input id="wizardEventDate" placeholder="Sunday 19 July · 19:00"></label><label>Button text<input id="wizardCtaLabel" value="Read more"></label></div><label>Button link<input id="wizardCtaUrl" placeholder="https://..."></label><label>Full event text<textarea id="wizardBody"></textarea></label></div>`;
  if(type==='ranked-list')return titleAndText+`<div class="wizardFieldsPanel"><h3>Countdown</h3><div class="twoCols"><label>List size<select id="wizardListSize"><option value="10">Top 10</option><option value="20">Top 20</option></select></label><label>Intro label<input id="wizardListLabel" value="DJ FOLSOE COUNTDOWN"></label></div><div id="wizardTrackRows" class="wizardTrackRows"></div></div>`;
  if(type==='story')return titleAndText+media+`<div class="wizardFieldsPanel"><h3>Story</h3><label>Full story<textarea id="wizardBody" style="min-height:230px"></textarea></label><label>Optional external link<input id="wizardCtaUrl" placeholder="https://..."></label></div>`;
  if(type==='poll')return titleAndText+`<div class="wizardFieldsPanel"><h3>Question and answers</h3><label>Question<input id="wizardQuestion" placeholder="What should we play next?"></label><div id="wizardPollRows" class="wizardPollRows"></div><button type="button" id="wizardAddAnswer" class="secondary">Add answer</button></div>`;
  if(type==='playlist')return titleAndText+media+`<div class="wizardFieldsPanel"><h3>Playlist</h3><label>Spotify or playlist link<input id="wizardPlaylistUrl" placeholder="https://open.spotify.com/..."></label><label>Button text<input id="wizardCtaLabel" value="Open playlist"></label><label>About this playlist<textarea id="wizardBody"></textarea></label></div>`;
  return titleAndText+media+`<div class="wizardFieldsPanel"><h3>Text</h3><label>Full text<textarea id="wizardBody" style="min-height:220px"></textarea></label></div>`;
}
function wizardTrackRow(index){
  return `<div class="wizardTrackRow"><input value="${index+1}" disabled><input data-wizard-artist placeholder="Artist"><input data-wizard-title placeholder="Track title"><input data-wizard-year placeholder="Year"><button type="button" data-remove-wizard-row class="secondary">×</button><textarea data-wizard-story placeholder="Short story about the song"></textarea></div>`;
}
function wizardPollRow(index){
  return `<div class="wizardPollRow"><input value="${String.fromCharCode(65+index)}" disabled><input data-wizard-answer placeholder="Answer option"><button type="button" data-remove-wizard-row class="secondary">×</button></div>`;
}
function bindWizardDynamicFields(){
  if(wizardState.type==='ranked-list'){
    const render=()=>{
      const size=Number($('wizardListSize').value||10);
      $('wizardTrackRows').innerHTML=Array.from({length:size},(_,i)=>wizardTrackRow(i)).join('');
    };
    render();$('wizardListSize').onchange=render;
  }
  if(wizardState.type==='poll'){
    $('wizardPollRows').innerHTML=[0,1].map(wizardPollRow).join('');
    $('wizardAddAnswer').onclick=()=>{
      const count=document.querySelectorAll('[data-wizard-answer]').length;
      $('wizardPollRows').insertAdjacentHTML('beforeend',wizardPollRow(count));
    };
  }
  $('wizardImageFile')?.addEventListener('change',event=>{
    const file=event.target.files?.[0];if(!file)return;
    const preview=$('wizardImagePreview');preview.src=URL.createObjectURL(file);preview.hidden=false;
  });
}
function collectWizardContent(){
  const type=wizardState.type;
  const content={};
  const media={image:$('wizardImageUrl')?.value||''};
  if(type==='poster'){content.dateLabel=$('wizardEventDate').value;content.ctaLabel=$('wizardCtaLabel').value;content.ctaUrl=$('wizardCtaUrl').value;content.body=$('wizardBody').value}
  if(type==='ranked-list'){content.items=[...document.querySelectorAll('.wizardTrackRow')].map((row,i)=>({rank:i+1,artist:row.querySelector('[data-wizard-artist]').value,title:row.querySelector('[data-wizard-title]').value,year:row.querySelector('[data-wizard-year]').value,story:row.querySelector('[data-wizard-story]').value})).filter(item=>item.artist||item.title);content.label=$('wizardListLabel').value}
  if(type==='story'||type==='text'){content.body=$('wizardBody').value;if($('wizardCtaUrl'))content.ctaUrl=$('wizardCtaUrl').value}
  if(type==='poll'){content.question=$('wizardQuestion').value;content.options=[...document.querySelectorAll('[data-wizard-answer]')].map((input,i)=>({id:String.fromCharCode(97+i),label:input.value,votes:0})).filter(item=>item.label)}
  if(type==='playlist'){content.url=$('wizardPlaylistUrl').value;content.ctaLabel=$('wizardCtaLabel').value;content.body=$('wizardBody').value}
  return {content,media};
}
async function finishWizard(){
  try{
    const publishMode=document.querySelector('input[name="wizardPublishMode"]:checked')?.value||'draft';
    let status=publishMode==='published'?'published':'draft';
    const visibility=$('wizardVisibility').value;
    const {content,media}=collectWizardContent();
    const file=$('wizardImageFile')?.files?.[0];
    if(file)media.image=await uploadFile(file)||media.image;
    const module={
      type:wizardState.type,
      title:$('wizardContentTitle').value,
      description:$('wizardContentDescription').value,
      theme:$('wizardTheme').value,
      showId:$('wizardShow').value,
      status,
      enabled:true,
      surfaces:{website:visibility!=='overlay',overlay:visibility!=='website'},
      placement:{websiteZone:document.querySelector('input[name="wizardZone"]:checked')?.value||'featured',overlayZone:`separate-${wizardState.type}`},
      schedule:{
        startsAt:publishMode==='scheduled'&&$('wizardStart').value?new Date($('wizardStart').value).toISOString():null,
        endsAt:publishMode==='scheduled'&&$('wizardEnd').value?new Date($('wizardEnd').value).toISOString():null
      },
      display:{pinned:$('wizardPinned').checked,label:wizardState.type.replace('-',' ')},
      content,media
    };
    const result=await api('/api/content/admin/module',{method:'POST',body:JSON.stringify({module})});
    state.modules.unshift(result.module);
    closeWizard();renderAll();
    v1700Start();
    v1701Start();toast('Content created.');
  }catch(error){toast(error.message,true)}
}
async function quickToggleModule(id,patch){
  try{
    const result=await api('/api/cms/admin/module/toggle',{method:'POST',body:JSON.stringify({id,...patch})});
    const index=state.modules.findIndex(m=>m.id===id);if(index>=0)state.modules[index]=result.module;
    renderAll();toast('Content updated.');
  }catch(error){toast(error.message,true)}
}

function openScreen(name){document.querySelectorAll('#cmsNav button').forEach(b=>b.classList.toggle('active',b.dataset.screen===name));document.querySelectorAll('[data-screen-panel]').forEach(p=>p.classList.toggle('active',p.dataset.screenPanel===name));$('screenTitle').textContent=document.querySelector(`#cmsNav [data-screen="${name}"] span`)?.textContent||name}
async function connect({silent=false}={}){
  const entered=$('adminToken').value.trim();
  if(entered)localStorage.setItem('djf_cms_token',entered);
  if(!token()){if(!silent)toast('Enter the admin password first.',true);return false}
  $('loadCms').disabled=true;$('loadCms').textContent='Connecting…';hideConnectionPanel();
  try{
    const health=await preflight();if(!health)return false;
    state=await api('/api/cms/admin/state');
    $('loadingState').hidden=true;$('cmsScreens').hidden=false;
    $('connectionDot').classList.add('online');$('connectionText').textContent='Connected';
    renderAll();
    showConnectionPanel({title:'Broadcast Control Room connected',message:'Website, Worker, Twitch data, Music News and Main Overlay controls are ready.',details:[state.version||health.version,`${state.modules?.length||0} content blocks`,`${state.news?.articles?.length||0} music stories`,state.core?.twitch?.live?'Twitch live':'Twitch offline','Main Overlay protected']},true);
    setTimeout(hideConnectionPanel,4500);
    if(!silent)toast('Content studio connected.');
    return true;
  }catch(error){
    $('cmsScreens').hidden=true;$('loadingState').hidden=false;
    $('connectionDot').classList.remove('online');$('connectionText').textContent='Connection failed';
    const info=friendlyError(error);showConnectionPanel(info);if(!silent)toast(info.title,true);return false;
  }finally{$('loadCms').disabled=false;$('loadCms').textContent='Connect'}
}
function renderAll(){renderDashboard();renderSystemStatus();renderBroadcastContentPlatform();renderBroadcastExperience();renderTvStation();renderSceneComposer();renderHomepage();renderModules();renderShows();renderChart();renderNews();renderPolls();renderPlaylists();renderTheme();renderSchedule();populateGlobalSelects()}
function populateGlobalSelects(){$('nextThemeInput').innerHTML=themeOptions(state.core?.nextShow?.theme||'weekend',false);$('contentTheme').innerHTML=themeOptions('all');$('contentShow').innerHTML=showOptions('all')}
function renderSystemStatus(){
  const dashboard=document.querySelector('[data-screen-panel="dashboard"]');
  if(!dashboard)return;
  document.getElementById('cmsSystemStatus')?.remove();
  const wrap=document.createElement('div');wrap.id='cmsSystemStatus';wrap.className='cmsSystemStatus';
  const twitch=state?.core?.twitch||{};
  const items=[['Website','ONLINE','ok'],['Worker',state?.version||'CONNECTED','ok'],['Twitch',twitch.live||twitch.isLive?'LIVE':'OFFLINE',twitch.live||twitch.isLive?'ok':'warning'],['Music News',`${state?.news?.articles?.length||0} STORIES`,'ok'],['Main Overlay','PROTECTED','ok']];
  wrap.innerHTML=items.map(([label,value,kind])=>`<article><span>${esc(label)}</span><strong class="${kind}">${esc(value)}</strong></article>`).join('');
  dashboard.querySelector('.welcomePanel')?.insertAdjacentElement('afterend',wrap);
}

function renderVisualDashboard(){
  const panel=document.querySelector('[data-screen-panel="dashboard"]');
  if(!panel||!state)return;

  const modules=Array.isArray(state.modules)?state.modules:[];
  const articles=Array.isArray(state.news?.articles)?state.news.articles:[];
  const twitch=state.core?.twitch||{};
  const currentTheme=state.core?.theme?.title||'Weekend';
  const currentShow=state.core?.show?.title||state.core?.show?.current||state.core?.nextShow?.title||'No show selected';
  const profileImage=twitch.profileImage||twitch.profile_image_url||'';
  const isLive=!!(twitch.live||twitch.isLive);
  const published=modules.filter(m=>m.status==='published').length;
  const drafts=modules.filter(m=>m.status==='draft').length;

  panel.innerHTML=`
    <section class="controlRoomHero">
      <div class="controlRoomHeroCopy">
        <span>DJ FOLSOE NETWORK · BROADCAST CONTROL ROOM</span>
        <h2>Ready to build the next show</h2>
        <p>Manage the homepage, shows, charts, stories, interaction and broadcast theme from one stable production desk.</p>
        <div class="controlRoomHeroActions">
          <button data-screen-jump="homepage">Edit homepage</button>
          <button data-quick-create="poster" class="secondary">Create special event</button>
          <a class="previewLink" href="/" target="_blank" rel="noopener">Open website ↗</a>
        </div>
      </div>

      <aside class="controlRoomProfile">
        <div class="controlRoomProfileImage">
          <img src="${esc(profileImage)}" alt="DJ FOLSOE Twitch profile">
          <span class="controlRoomLiveDot ${isLive?'live':''}"></span>
        </div>
        <div>
          <small>${isLive?'LIVE ON TWITCH':'TWITCH CHANNEL'}</small>
          <strong>${esc(twitch.displayName||'DJ FOLSOE')}</strong>
          <p>${esc(twitch.description||'Live music, requests and good company from Denmark.')}</p>
        </div>
      </aside>
    </section>

    <section class="controlRoomStatusGrid">
      <article class="controlRoomStatusCard online">
        <span>Website</span>
        <strong>ONLINE</strong>
        <small>folsoetv.dk is connected</small>
      </article>
      <article class="controlRoomStatusCard online">
        <span>Worker</span>
        <strong>CONNECTED</strong>
        <small>${esc(state.version||'Broadcast Core')}</small>
      </article>
      <article class="controlRoomStatusCard ${isLive?'online':'warning'}">
        <span>Twitch</span>
        <strong>${isLive?'LIVE':'OFFLINE'}</strong>
        <small>${Number(twitch.viewers||0).toLocaleString()} current viewers</small>
      </article>
      <article class="controlRoomStatusCard accent">
        <span>Published</span>
        <strong>${published}</strong>
        <small>${drafts} drafts waiting</small>
      </article>
      <article class="controlRoomStatusCard">
        <span>Music stories</span>
        <strong>${articles.length}</strong>
        <small>Editorial and external</small>
      </article>
    </section>

    <section class="controlRoomQuickGrid">
      <button class="controlRoomQuick" data-screen-jump="homepage">
        <i>✦</i>
        <strong>Homepage</strong>
        <span>Edit the public opening experience</span>
      </button>
      <button class="controlRoomQuick" data-screen-jump="shows">
        <i>▶</i>
        <strong>Shows</strong>
        <span>Update titles, times and descriptions</span>
      </button>
      <button class="controlRoomQuick" data-screen-jump="charts">
        <i>20</i>
        <strong>Top 20</strong>
        <span>Build this week's countdown</span>
      </button>
      <button class="controlRoomQuick" data-screen-jump="theme">
        <i>◐</i>
        <strong>Theme & Overlay</strong>
        <span>Choose the active broadcast identity</span>
      </button>
      <button class="controlRoomQuick" data-quick-create="story">
        <i>✎</i>
        <strong>Music Story</strong>
        <span>Write an article or editorial feature</span>
      </button>
      <button class="controlRoomQuick" data-quick-create="poll">
        <i>✓</i>
        <strong>Poll</strong>
        <span>Create live viewer interaction</span>
      </button>
      <button class="controlRoomQuick" data-quick-create="playlist">
        <i>♫</i>
        <strong>Playlist</strong>
        <span>Share Spotify and show playlists</span>
      </button>
      <button class="controlRoomQuick" data-quick-create="poster">
        <i>▣</i>
        <strong>Special Event</strong>
        <span>Publish a poster, date and announcement</span>
      </button>
    </section>

    <section class="controlRoomBottomGrid">
      <article class="controlRoomPanel">
        <div class="controlRoomPanelHeader">
          <div><span>RECENT CONTENT</span><h3>Continue working</h3></div>
          <button data-screen-jump="modules" class="secondary">View all</button>
        </div>
        <div class="controlRoomRecent">
          ${modules.slice(0,6).map(m=>`
            <div class="controlRoomRecentItem">
              <span>${esc(typeIcons[m.type]||'▦')}</span>
              <div>
                <strong>${esc(m.title||'Untitled content')}</strong>
                <small>${esc(m.type||'content')} · ${esc(m.status||'draft')} · ${esc(m.theme||'all')}</small>
              </div>
              <button data-edit-module="${esc(m.id)}" class="secondary">Edit</button>
            </div>
          `).join('')||'<p class="note">No content blocks yet.</p>'}
        </div>
      </article>

      <aside class="controlRoomPanel">
        <div class="controlRoomPanelHeader">
          <div><span>ON AIR CONTROL</span><h3>Current broadcast</h3></div>
        </div>
        <div class="controlRoomBroadcast">
          <div class="controlRoomBroadcastRow"><span>Active theme</span><strong>${esc(currentTheme)}</strong></div>
          <div class="controlRoomBroadcastRow"><span>Current / next show</span><strong>${esc(currentShow)}</strong></div>
          <div class="controlRoomBroadcastRow"><span>Followers</span><strong>${Number(twitch.followers||state.core?.community?.followers||0).toLocaleString()}</strong></div>
          <div class="controlRoomBroadcastRow"><span>Profile</span><strong>${profileImage?'CONNECTED':'WAITING'}</strong></div>
        </div>
        <div class="controlRoomProtected">✓ Main Overlay structure is protected</div>
      </aside>
    </section>
  `;
}

function renderDashboard(){renderVisualDashboard();}
function renderHomepage(){const core=state.core||{},hero=core.hero||{},next=core.nextShow||{},community=core.community||{};$('heroEyebrowInput').value=hero.eyebrow||'';$('heroTitleInput').value=hero.title||'DJ FOLSOE';$('heroSubtitleInput').value=hero.subtitle||'';$('heroTextInput').value=hero.text||'';$('nextTitleInput').value=next.title||next.show||'';$('nextTimeLabelInput').value=next.timeLabel||'';$('nextDateInput').value=toLocalInput(next.datetime||next.dateTime);$('nextDescriptionInput').value=next.description||'';$('followerGoalInput').value=community.followerGoal??1000;$('subGoalInput').value=community.subGoal??100;$('requestTextInput').value=community.requestText||'';$('specialEventInput').value=community.specialEvent||'';updateHomepagePreview()}
function updateHomepagePreview(){$('previewEyebrow').textContent=$('heroEyebrowInput').value||'LIVE MUSIC FROM DENMARK';$('previewTitle').textContent=$('heroTitleInput').value||'DJ FOLSOE';$('previewSubtitle').textContent=$('heroSubtitleInput').value||'Live music, requests and good company';$('previewText').textContent=$('heroTextInput').value||''}
async function saveHomepage(){try{const payload={hero:{eyebrow:$('heroEyebrowInput').value,title:$('heroTitleInput').value,subtitle:$('heroSubtitleInput').value,text:$('heroTextInput').value},nextShow:{title:$('nextTitleInput').value,timeLabel:$('nextTimeLabelInput').value,datetime:$('nextDateInput').value?new Date($('nextDateInput').value).toISOString():'',theme:$('nextThemeInput').value,description:$('nextDescriptionInput').value,active:true},community:{followerGoal:Number($('followerGoalInput').value),subGoal:Number($('subGoalInput').value),requestText:$('requestTextInput').value,specialEvent:$('specialEventInput').value},overlay:{requestText:$('requestTextInput').value,specialEvent:$('specialEventInput').value}};const result=await api('/api/cms/admin/homepage',{method:'POST',body:JSON.stringify(payload)});state.core=result.core;renderDashboard();toast('Homepage saved.')}catch(error){toast(error.message,true)}}
function moduleScheduled(m){const start=m.schedule?.startsAt&&new Date(m.schedule.startsAt)>new Date();return start}

function renderBroadcastContentPlatform(){
  if(!state)return;

  const modules=Array.isArray(state.modules)?state.modules:[];
  const stories=Array.isArray(state.news?.articles)?state.news.articles:[];
  const shows=Array.isArray(state.core?.featuredShows)?state.core.featuredShows:[];

  const values={
    platformPublishedCount:modules.filter(module=>module.status==='published').length,
    platformDraftCount:modules.filter(module=>module.status==='draft').length,
    platformNewsCount:stories.length,
    platformShowCount:shows.length,
    platformThemeName:state.core?.theme?.title||'Weekend'
  };

  Object.entries(values).forEach(([id,value])=>{
    const node=document.getElementById(id);
    if(node)node.textContent=String(value);
  });
}


function renderBroadcastExperience(){
  if(!state)return;

  const modules=Array.isArray(state.modules)?state.modules:[];
  const polls=modules.filter(module=>module.type==='poll');
  const playlists=modules.filter(module=>module.type==='playlist');
  const events=modules.filter(module=>module.type==='poster');
  const overlayModules=modules.filter(module=>module.surfaces?.overlay===true);

  const values={
    experienceTheme:state.core?.theme?.title||'Weekend',
    experiencePolls:polls.filter(module=>module.status==='published').length,
    experiencePlaylists:playlists.length,
    experienceEvents:events.length,
    experienceOverlayModules:overlayModules.length
  };

  Object.entries(values).forEach(([id,value])=>{
    const node=document.getElementById(id);
    if(node)node.textContent=String(value);
  });
}


function renderTvStation(){
  if(!state)return;

  const modules=Array.isArray(state.modules)?state.modules:[];
  const shows=Array.isArray(state.core?.featuredShows)?state.core.featuredShows:[];
  const twitch=state.core?.twitch||{};
  const next=state.core?.nextShow||{};
  const isLive=!!(twitch.live||twitch.isLive);

  const published=modules.filter(module=>module.status==='published').length;
  const drafts=modules.filter(module=>module.status==='draft').length;
  const scheduled=modules.filter(module=>moduleScheduled(module)).length;
  const overlayReady=modules.filter(module=>module.surfaces?.overlay===true).length;

  const write=(id,value)=>{
    const node=document.getElementById(id);
    if(node)node.textContent=String(value);
  };

  write('stationStatusLabel',isLive?'ON AIR':'READY');
  write('stationStatusText',isLive?'DJ FOLSOE is live on Twitch':'Waiting for live broadcast');
  write('stationWorkerVersion',state.version||'Broadcast Core');
  write('stationTwitchStatus',isLive?'LIVE':'OFFLINE');
  write('stationViewerCount',`${Number(twitch.viewers||0).toLocaleString()} viewers`);
  write('stationShowCount',`${shows.length} SHOWS`);
  write('stationContentCount',`${modules.length} ITEMS`);
  write('stationThemeName',state.core?.theme?.title||'Weekend');
  write('stationPublished',published);
  write('stationDrafts',drafts);
  write('stationScheduled',scheduled);
  write('stationOverlayReady',overlayReady);
  write('stationNextShowTitle',next.title||next.show||'No show selected');
  write('stationNextShowDescription',next.description||'Add or update the next programme in the existing Homepage or Shows editor.');
  write('stationNextShowTime',next.timeLabel||next.datetime||next.dateTime||'Time not set');
  write('stationNextShowTheme',next.theme||state.core?.theme?.title||'Theme not set');

  const onAir=document.querySelector('.stationOnAir');
  if(onAir)onAir.classList.toggle('live',isLive);

  const list=document.getElementById('stationShowList');
  if(list){
    list.innerHTML=shows.slice(0,6).map((show,index)=>`
      <article class="stationShowCard">
        <span>${String(index+1).padStart(2,'0')}</span>
        <strong>${esc(show.title||'Untitled show')}</strong>
        <small>${esc(show.time||show.day||show.theme||'Schedule not set')}</small>
      </article>
    `).join('')||`
      <article class="stationShowCard">
        <span>01</span>
        <strong>No shows loaded</strong>
        <small>Use Show Manager to add programmes.</small>
      </article>
    `;
  }
}


function sceneComposerDefaults(){return{enabled:{topTicker:false,bottomTicker:false,chat:false},urls:{main:'',topTicker:'',bottomTicker:'',chat:''}}}
function readSceneComposer(){try{const s=JSON.parse(localStorage.getItem(SCENE_COMPOSER_KEY)||'null'),d=sceneComposerDefaults();return{enabled:{...d.enabled,...(s?.enabled||{})},urls:{...d.urls,...(s?.urls||{})}}}catch(_){return sceneComposerDefaults()}}
function collectSceneComposer(){const c=readSceneComposer();return{enabled:{...c.enabled},urls:{main:document.getElementById('composerUrlMain')?.value.trim()||'',topTicker:document.getElementById('composerUrlTopTicker')?.value.trim()||'',bottomTicker:document.getElementById('composerUrlBottomTicker')?.value.trim()||'',chat:document.getElementById('composerUrlChat')?.value.trim()||''}}}
function renderSceneComposer(){const screen=document.querySelector('[data-screen-panel="composer"]');if(!screen||!state)return;const c=readSceneComposer(),t=state.core?.twitch||{};const write=(id,v)=>{const n=document.getElementById(id);if(n)n.textContent=String(v)};write('composerTheme',state.core?.theme?.title||'Weekend');write('composerTwitch',(t.live||t.isLive)?'LIVE':'OFFLINE');const map={main:'composerUrlMain',topTicker:'composerUrlTopTicker',bottomTicker:'composerUrlBottomTicker',chat:'composerUrlChat'};Object.entries(map).forEach(([k,id])=>{const f=document.getElementById(id);if(f&&document.activeElement!==f)f.value=c.urls[k]||''});['topTicker','bottomTicker','chat'].forEach(k=>{const on=!!c.enabled[k],b=document.querySelector(`[data-composer-toggle="${k}"]`),l=document.querySelector(`[data-composer-layer="${k}"]`);if(b)b.classList.toggle('on',on);if(l)l.classList.toggle('enabled',on);write({topTicker:'composerStageTopTicker',bottomTicker:'composerStageBottomTicker',chat:'composerStageChat'}[k],on?'ON':'OFF')})}
function toggleSceneComposerLayer(key){const c=collectSceneComposer();c.enabled[key]=!c.enabled[key];localStorage.setItem(SCENE_COMPOSER_KEY,JSON.stringify(c));renderSceneComposer()}
function saveSceneComposerLocal(){const c=collectSceneComposer(),e=readSceneComposer();c.enabled={...e.enabled};localStorage.setItem(SCENE_COMPOSER_KEY,JSON.stringify(c));renderSceneComposer();toast('Local scene plan saved.')}
function previewSceneComposerLayer(key){const u=collectSceneComposer().urls[key]||'';if(!u)return toast('Paste the StreamElements overlay URL first.',true);try{window.open(new URL(u,window.location.href).href,'_blank','noopener')}catch(_){toast('The overlay URL is not valid.',true)}}
function resetSceneComposer(){localStorage.removeItem(SCENE_COMPOSER_KEY);renderSceneComposer();toast('Local scene plan reset.')}


/* =========================================================
   V1700 — BROADCAST INTELLIGENCE ENGINE
   Read-only heartbeat. No Worker writes.
   ========================================================= */
const V1700_POLL_MS=10000;
const V1700_STANDBY_MINUTES=60;
const V1700_AFTERSHOW_MINUTES=30;
let v1700Timer=null;
let v1700Signature='';

function v1700FirstObject(...values){
  return values.find(value=>value&&typeof value==='object'&&!Array.isArray(value))||{};
}

function v1700FirstString(...values){
  return values.find(value=>typeof value==='string'&&value.trim())||'';
}

function v1700Timestamp(value){
  const time=value?new Date(value).getTime():0;
  return Number.isFinite(time)?time:0;
}

function v1700Normalize(payload){
  const root=v1700FirstObject(
    payload?.core,
    payload?.broadcast,
    payload?.data?.core,
    payload?.data,
    payload
  );

  const twitch=v1700FirstObject(
    root?.twitch,
    payload?.twitch,
    payload?.data?.twitch,
    root?.stream
  );

  const nextShow=v1700FirstObject(
    root?.nextShow,
    payload?.nextShow,
    payload?.data?.nextShow
  );

  const themeRaw=root?.theme||payload?.theme||{};

  return{
    live:Boolean(
      twitch.live??
      twitch.isLive??
      twitch.online??
      twitch.is_online??
      root.live??
      root.isLive
    ),
    viewers:Number(twitch.viewers??twitch.viewerCount??twitch.viewer_count??0),
    followers:Number(twitch.followers??twitch.followerCount??twitch.follower_count??root?.community?.followers??0),
    title:v1700FirstString(twitch.title,twitch.streamTitle,twitch.stream_title,root?.show?.title),
    category:v1700FirstString(twitch.category,twitch.gameName,twitch.game_name,'Music'),
    displayName:v1700FirstString(twitch.displayName,twitch.display_name,'DJ FOLSOE'),
    profileImage:v1700FirstString(twitch.profileImage,twitch.profile_image_url,twitch.profileImageUrl,root?.profileImage),
    startedAt:v1700FirstString(twitch.startedAt,twitch.started_at),
    endedAt:v1700FirstString(twitch.endedAt,twitch.ended_at,root?.lastStreamEndedAt),
    themeId:String(typeof themeRaw==='string'?themeRaw:(themeRaw?.id||themeRaw?.key||'weekend')).toLowerCase(),
    themeTitle:v1700FirstString(typeof themeRaw==='object'?themeRaw?.title:'',typeof themeRaw==='string'?themeRaw:'','Weekend'),
    nextShowTitle:v1700FirstString(nextShow.title,nextShow.show,nextShow.name),
    nextShowStart:v1700FirstString(nextShow.start,nextShow.startTime,nextShow.dateTime,nextShow.datetime),
    nowPlaying:v1700FirstObject(root?.nowPlaying,payload?.nowPlaying)
  };
}

function v1700Mode(snapshot){
  if(snapshot.live)return'LIVE';

  const now=Date.now();
  const next=v1700Timestamp(snapshot.nextShowStart);

  if(next&&next>=now&&next-now<=V1700_STANDBY_MINUTES*60*1000){
    return'STANDBY';
  }

  const ended=v1700Timestamp(snapshot.endedAt);

  if(ended&&now>=ended&&now-ended<=V1700_AFTERSHOW_MINUTES*60*1000){
    return'AFTERSHOW';
  }

  return'OFFLINE';
}

async function v1700Read(){
  const routes=['/api/twitch','/api/broadcast','/api/cms/public/state'];

  for(const route of routes){
    try{
      const response=await fetch(API_BASE+route,{
        cache:'no-store',
        headers:{Accept:'application/json'}
      });

      if(!response.ok)throw new Error(`HTTP ${response.status}`);

      return v1700Normalize(await response.json());
    }catch(error){
      console.warn(`V1700 admin route failed: ${route}`,error);
    }
  }

  throw new Error('No Broadcast Intelligence source responded.');
}

function v1700EnsurePanel(){
  let panel=document.getElementById('v1700IntelligencePanel');
  if(panel)return panel;

  const dashboard=document.querySelector('[data-screen-panel="dashboard"]');
  if(!dashboard)return null;

  panel=document.createElement('section');
  panel.id='v1700IntelligencePanel';
  panel.innerHTML=`
    <div class="v1700IntelligenceHead">
      <div>
        <small>V1700 · BROADCAST INTELLIGENCE</small>
        <h3>One signal across the network</h3>
      </div>
      <strong id="v1700Mode" class="v1700ModeBadge" data-mode="OFFLINE">OFFLINE</strong>
    </div>

    <div class="v1700IntelligenceGrid">
      <article><span>Theme</span><strong id="v1700Theme">—</strong></article>
      <article><span>Viewers</span><strong id="v1700Viewers">0</strong></article>
      <article><span>Stream title</span><strong id="v1700Title">—</strong></article>
      <article><span>Next show</span><strong id="v1700Next">—</strong></article>
      <article><span>Now Playing</span><strong id="v1700NowPlaying">Reserved</strong></article>
    </div>
  `;

  dashboard.prepend(panel);
  return panel;
}

function v1700Text(id,value){
  const node=document.getElementById(id);
  if(node)node.textContent=String(value??'—');
}

function v1700Apply(snapshot){
  const mode=v1700Mode(snapshot);
  const complete={...snapshot,mode};
  const signature=JSON.stringify(complete);

  if(signature===v1700Signature)return;
  v1700Signature=signature;

  state=state||{};
  state.core=state.core||{};
  state.core.twitch={
    ...(state.core.twitch||{}),
    live:snapshot.live,
    isLive:snapshot.live,
    viewers:snapshot.viewers,
    followers:snapshot.followers,
    title:snapshot.title,
    category:snapshot.category,
    displayName:snapshot.displayName,
    profileImage:snapshot.profileImage,
    startedAt:snapshot.startedAt
  };

  if(snapshot.themeId){
    state.core.theme={
      ...(typeof state.core.theme==='object'?state.core.theme:{}),
      id:snapshot.themeId,
      title:snapshot.themeTitle
    };
  }

  const panel=v1700EnsurePanel();
  if(panel){
    const badge=document.getElementById('v1700Mode');
    if(badge){
      badge.dataset.mode=mode;
      badge.textContent=mode;
    }

    v1700Text('v1700Theme',snapshot.themeTitle);
    v1700Text('v1700Viewers',snapshot.viewers.toLocaleString());
    v1700Text('v1700Title',snapshot.title||'No current stream title');
    v1700Text('v1700Next',snapshot.nextShowTitle||'Not announced');

    const np=snapshot.nowPlaying||{};
    const nowText=
      np.artist&&np.title
        ?`${np.artist} — ${np.title}`
        :'Reserved for Serato';

    v1700Text('v1700NowPlaying',nowText);
  }

  document.documentElement.dataset.broadcastMode=mode;
  document.documentElement.dataset.activeTheme=snapshot.themeId;

  try{
    renderSystemStatus?.();
    renderVisualDashboard?.();
    renderBroadcastContentPlatform?.();
    renderBroadcastExperience?.();
    renderTvStation?.();
    renderSceneComposer?.();
  }catch(error){
    console.warn('V1700 safe render warning',error);
  }

  window.DJF_BROADCAST_STATE=complete;

  window.dispatchEvent(
    new CustomEvent('djf:broadcast-state',{detail:complete})
  );
}

async function v1700Refresh(){
  if(!state)return;

  try{
    v1700Apply(await v1700Read());
  }catch(error){
    console.warn('V1700 heartbeat failed',error);
  }
}

function v1700Start(){
  clearInterval(v1700Timer);
  v1700EnsurePanel();
  v1700Refresh();
  v1700Timer=setInterval(v1700Refresh,V1700_POLL_MS);
}

window.DJF_BROADCAST_INTELLIGENCE={
  version:'V1700',
  refresh:v1700Refresh,
  getState:()=>window.DJF_BROADCAST_STATE||null
};


/* =========================================================
   V1701 — BROADCAST VERIFICATION & SAFE AUTOMATION
   Read-only. No Worker or KV writes.
   ========================================================= */
const V1701_ROUTES=[
  {id:'twitch',path:'/api/twitch',priority:1},
  {id:'broadcast',path:'/api/broadcast',priority:2},
  {id:'cms',path:'/api/cms/public/state',priority:3}
];

let v1701Timer=null;
let v1701LastSignature='';

function v1701FirstObject(...values){
  return values.find(value=>value&&typeof value==='object'&&!Array.isArray(value))||{};
}

function v1701FirstString(...values){
  return values.find(value=>typeof value==='string'&&value.trim())||'';
}

function v1701Normalize(payload,sourceId){
  const root=v1701FirstObject(
    payload?.core,
    payload?.broadcast,
    payload?.data?.core,
    payload?.data,
    payload
  );

  const twitch=v1701FirstObject(
    root?.twitch,
    payload?.twitch,
    payload?.data?.twitch,
    root?.stream
  );

  const themeRaw=root?.theme||payload?.theme||{};

  return{
    sourceId,
    live:Boolean(
      twitch.live??
      twitch.isLive??
      twitch.online??
      twitch.is_online??
      root.live??
      root.isLive
    ),
    viewers:Number(twitch.viewers??twitch.viewerCount??twitch.viewer_count??0),
    title:v1701FirstString(twitch.title,twitch.streamTitle,twitch.stream_title,root?.show?.title),
    themeId:String(typeof themeRaw==='string'?themeRaw:(themeRaw?.id||themeRaw?.key||'weekend')).toLowerCase(),
    themeTitle:v1701FirstString(typeof themeRaw==='object'?themeRaw?.title:'',typeof themeRaw==='string'?themeRaw:'','Weekend'),
    checkedAt:Date.now()
  };
}

async function v1701ReadRoute(route){
  const started=performance.now();

  try{
    const response=await fetch(API_BASE+route.path,{
      cache:'no-store',
      headers:{Accept:'application/json'}
    });

    if(!response.ok)throw new Error(`HTTP ${response.status}`);

    return{
      ...route,
      ok:true,
      latency:Math.round(performance.now()-started),
      state:v1701Normalize(await response.json(),route.id)
    };
  }catch(error){
    return{
      ...route,
      ok:false,
      latency:Math.round(performance.now()-started),
      error:error.message,
      state:null
    };
  }
}

function v1701ChooseTruth(results){
  return results
    .filter(result=>result.ok&&result.state)
    .sort((a,b)=>a.priority-b.priority)[0]||null;
}

function v1701Compare(results){
  const valid=results.filter(result=>result.ok&&result.state);
  const truth=v1701ChooseTruth(valid);
  const mismatches=[];

  if(!truth){
    return{
      health:'RED',
      truth:null,
      mismatches:['No Broadcast Intelligence source responded'],
      failed:results.map(result=>result.id)
    };
  }

  valid.forEach(result=>{
    if(result.id===truth.id)return;

    if(result.state.live!==truth.state.live){
      mismatches.push(
        `${result.id}.live=${result.state.live} / ${truth.id}.live=${truth.state.live}`
      );
    }

    if(
      result.state.themeId&&
      truth.state.themeId&&
      result.state.themeId!==truth.state.themeId
    ){
      mismatches.push(
        `${result.id}.theme=${result.state.themeId} / ${truth.id}.theme=${truth.state.themeId}`
      );
    }
  });

  const failed=results.filter(result=>!result.ok).map(result=>result.id);

  return{
    health:!failed.length&&!mismatches.length?'GREEN':'YELLOW',
    truth,
    mismatches,
    failed
  };
}

function v1701EnsurePanel(){
  let panel=document.getElementById('v1701VerificationPanel');
  if(panel)return panel;

  const dashboard=document.querySelector('[data-screen-panel="dashboard"]');
  if(!dashboard)return null;

  panel=document.createElement('section');
  panel.id='v1701VerificationPanel';
  panel.innerHTML=`
    <div class="v1701Head">
      <div>
        <small>V1701 · VERIFICATION & SAFE AUTOMATION</small>
        <h3>Trust, compare and protect</h3>
      </div>
      <strong id="v1701Health" class="v1701Health" data-health="YELLOW">CHECKING</strong>
    </div>

    <div id="v1701SourceGrid" class="v1701SourceGrid"></div>

    <div id="v1701WarningBox" class="v1701WarningBox">
      Waiting for the first verification cycle.
    </div>

    <div class="v1701AutomationGrid">
      <article><span>LIVE</span><strong>Display mode only</strong></article>
      <article><span>OFFLINE</span><strong>Display mode only</strong></article>
      <article><span>STANDBY</span><strong>No theme changes</strong></article>
      <article><span>AFTERSHOW</span><strong>No content writes</strong></article>
    </div>
  `;

  const intelligence=document.getElementById('v1700IntelligencePanel');
  if(intelligence&&intelligence.parentNode){
    intelligence.insertAdjacentElement('afterend',panel);
  }else{
    dashboard.prepend(panel);
  }

  return panel;
}

function v1701RenderSource(result,truthId){
  const state=result.state||{};

  return`
    <article class="v1701SourceCard">
      <header>
        <strong>${result.id.toUpperCase()}${result.id===truthId?' · TRUTH':''}</strong>
        <span>${result.ok?`${result.latency} ms`:'FAILED'}</span>
      </header>
      <dl>
        <dt>Route</dt><dd>${result.path}</dd>
        <dt>Live</dt><dd>${result.ok?String(state.live):'—'}</dd>
        <dt>Theme</dt><dd>${result.ok?(state.themeTitle||state.themeId):'—'}</dd>
        <dt>Viewers</dt><dd>${result.ok?state.viewers:'—'}</dd>
        <dt>Title</dt><dd>${result.ok?(state.title||'No title'):(result.error||'Unavailable')}</dd>
      </dl>
    </article>
  `;
}

function v1701ApplyTruth(report){
  if(!report.truth?.state||!state)return;

  const selected=report.truth.state;

  state.core=state.core||{};
  state.core.twitch={
    ...(state.core.twitch||{}),
    live:selected.live,
    isLive:selected.live,
    viewers:selected.viewers,
    title:selected.title
  };

  state.core.theme={
    ...(typeof state.core.theme==='object'?state.core.theme:{}),
    id:selected.themeId,
    title:selected.themeTitle
  };

  document.documentElement.dataset.truthSource=report.truth.id;
  document.documentElement.dataset.verificationHealth=report.health;

  try{
    renderSystemStatus?.();
    renderVisualDashboard?.();
    renderBroadcastContentPlatform?.();
    renderBroadcastExperience?.();
    renderTvStation?.();
    renderSceneComposer?.();
  }catch(error){
    console.warn('V1701 safe render warning',error);
  }
}

function v1701Render(results,report){
  v1701EnsurePanel();

  const health=document.getElementById('v1701Health');
  if(health){
    health.dataset.health=report.health;
    health.textContent=report.health;
  }

  const grid=document.getElementById('v1701SourceGrid');
  if(grid){
    grid.innerHTML=results
      .map(result=>v1701RenderSource(result,report.truth?.id))
      .join('');
  }

  const warning=document.getElementById('v1701WarningBox');
  if(warning){
    const messages=[
      ...report.mismatches,
      ...report.failed.map(id=>`${id} route did not respond`)
    ];

    warning.classList.toggle('ok',!messages.length);

    warning.textContent=messages.length
      ?messages.join(' · ')
      :`All sources agree. Truth source: ${report.truth?.id||'none'}.`;
  }
}

async function v1701Refresh(){
  if(!state)return;

  const results=await Promise.all(V1701_ROUTES.map(v1701ReadRoute));
  const report=v1701Compare(results);
  const signature=JSON.stringify({results,report});

  if(signature===v1701LastSignature)return;
  v1701LastSignature=signature;

  v1701ApplyTruth(report);
  v1701Render(results,report);

  const payload={
    version:'V1701',
    checkedAt:Date.now(),
    health:report.health,
    truthSource:report.truth?.id||'',
    mismatches:report.mismatches,
    failed:report.failed,
    sources:results
  };

  window.DJF_BROADCAST_VERIFICATION=payload;

  try{
    localStorage.setItem(
      'djf_broadcast_verification_v1701',
      JSON.stringify(payload)
    );
  }catch(_){}

  window.dispatchEvent(
    new CustomEvent('djf:broadcast-verification',{detail:payload})
  );
}

function v1701Start(){
  clearInterval(v1701Timer);
  v1701EnsurePanel();
  v1701Refresh();
  v1701Timer=setInterval(v1701Refresh,10000);
}

window.DJF_BROADCAST_VERIFICATION_API={
  version:'V1701',
  refresh:v1701Refresh,
  getReport:()=>window.DJF_BROADCAST_VERIFICATION||null
};

function renderModules(){const modules=(state.modules||[]).filter(m=>currentModuleFilter==='all'||(currentModuleFilter==='scheduled'?moduleScheduled(m):m.status===currentModuleFilter));$('moduleList').innerHTML=modules.map(m=>`<article class="moduleRow" draggable="true" data-module-id="${esc(m.id)}"><span class="moduleDrag">⋮⋮</span><span class="moduleRowIcon">${typeIcons[m.type]||'▦'}</span><div><strong>${esc(m.title)}</strong><span class="statusPill ${esc(m.status)}">${moduleScheduled(m)?'scheduled':esc(m.status)}</span><small>${esc(m.type)} · ${esc(m.theme)} · ${esc(m.placement?.websiteZone||'editorial')}</small></div><div class="moduleActions"><button data-toggle-publish="${esc(m.id)}" class="secondary">${m.status==='published'?'Unpublish':'Publish'}</button><button data-toggle-website="${esc(m.id)}" class="secondary">${m.surfaces?.website===false?'Show on site':'Hide from site'}</button><button data-edit-module="${esc(m.id)}" class="secondary">Edit</button><button data-duplicate-module="${esc(m.id)}" class="secondary">Duplicate</button><button data-delete-module="${esc(m.id)}" class="secondary">Delete</button></div></article>`).join('')||'<p>No content in this view.</p>';installDragSort()}
function installDragSort(){document.querySelectorAll('.moduleRow').forEach(row=>{row.addEventListener('dragstart',()=>{draggedModuleId=row.dataset.moduleId;row.style.opacity='.45'});row.addEventListener('dragend',()=>{row.style.opacity='';draggedModuleId=''});row.addEventListener('dragover',e=>e.preventDefault());row.addEventListener('drop',async e=>{e.preventDefault();const target=row.dataset.moduleId;if(!draggedModuleId||target===draggedModuleId)return;const ids=[...document.querySelectorAll('.moduleRow')].map(x=>x.dataset.moduleId);const from=ids.indexOf(draggedModuleId),to=ids.indexOf(target);ids.splice(to,0,ids.splice(from,1)[0]);try{const result=await api('/api/cms/admin/modules/reorder',{method:'POST',body:JSON.stringify({order:ids})});state.modules=result.modules;renderModules();toast('Content order saved.')}catch(error){toast(error.message,true)}})})}
function renderShows(){const shows=state.core?.featuredShows||[];$('showsEditor').innerHTML=shows.map((s,i)=>showCard(s,i)).join('')||'<p>No shows yet. Press Add show.</p>'}
function showCard(s={},i=0){return `<article class="editCard" data-show-index="${i}"><div class="editCardHeader"><h3>${esc(s.title||`Show ${i+1}`)}</h3><div class="rowActions"><button data-move-show="${i}" data-dir="-1" class="secondary">↑</button><button data-move-show="${i}" data-dir="1" class="secondary">↓</button><button data-remove-show="${i}" class="secondary">Delete</button></div></div><div class="editCardGrid"><label class="imageDrop"><span>Click or drop image</span>${s.image?`<img src="${esc(s.image)}">`:''}<input type="file" accept="image/*" data-show-image="${i}"></label><div><label>Show title<input data-show-field="title" value="${esc(s.title||'')}"></label><label>When is it on?<input data-show-field="time" value="${esc(s.time||'')}"></label><label>Theme<select data-show-field="theme">${themeOptions(s.theme||'weekend',false)}</select></label></div><div><label>Description<textarea data-show-field="description">${esc(s.description||'')}</textarea></label><label>Accent colour<input data-show-field="color" type="color" value="${esc(s.color||'#55e5ff')}"></label><input type="hidden" data-show-field="image" value="${esc(s.image||'')}"></div></div></article>`}
function readShows(){return [...document.querySelectorAll('[data-show-index]')].map(card=>{const obj={};card.querySelectorAll('[data-show-field]').forEach(el=>obj[el.dataset.showField]=el.value);return obj})}
async function saveShows(){try{const result=await api('/api/cms/admin/shows',{method:'POST',body:JSON.stringify({shows:readShows()})});state.core=result.core;renderShows();renderDashboard();toast('Shows saved.')}catch(error){toast(error.message,true)}}
function renderChart(){const size=Number($('chartSize').value||20),items=state.core?.top20||[];$('chartEditor').innerHTML=Array.from({length:size},(_,i)=>chartRow(items[i]||{rank:i+1},i)).join('')}
function chartRow(item={},i){return `<article class="chartRow" data-chart-index="${i}"><span class="chartRank">${i+1}</span><label class="imageDrop"><span>Cover</span>${item.cover?`<img src="${esc(item.cover)}">`:''}<input type="file" accept="image/*" data-chart-image="${i}"></label><input data-chart-field="artist" placeholder="Artist" value="${esc(item.artist||'')}"><input data-chart-field="title" placeholder="Track title" value="${esc(item.title||'')}"><input data-chart-field="status" placeholder="NEW / UP" value="${esc(item.status||'')}"><button data-chart-story="${i}" class="secondary">Story</button><input type="hidden" data-chart-field="cover" value="${esc(item.cover||'')}"><input type="hidden" data-chart-field="story" value="${esc(item.story||'')}"></article>`}
function readChart(){return [...document.querySelectorAll('[data-chart-index]')].map((row,i)=>{const item={rank:i+1};row.querySelectorAll('[data-chart-field]').forEach(el=>item[el.dataset.chartField]=el.value);return item})}
async function saveChart(){try{const result=await api('/api/cms/admin/chart',{method:'POST',body:JSON.stringify({items:readChart()})});state.core=result.core;toast('Chart saved.')}catch(error){toast(error.message,true)}}
function renderNews(){const articles=state.news?.articles||[],manual=articles.filter(a=>a.manual),external=articles.filter(a=>!a.manual);$('newsEditorial').innerHTML=manual.map(newsCard).join('')||'<p>You have not written a story yet.</p>';$('newsExternal').innerHTML=external.slice(0,100).map(newsCard).join('')||'<p>Press Fetch external stories to load sources.</p>';$('newsSources').innerHTML=(state.news?.sources||[]).map((s,i)=>`<article class="sourceRow" data-source-index="${i}"><div class="twoCols"><label>Source name<input data-source-field="name" value="${esc(s.name)}"></label><label>Feed address<input data-source-field="url" value="${esc(s.url)}"></label><label>Priority<input data-source-field="priority" type="number" value="${Number(s.priority||50)}"></label><label><input data-source-field="enabled" type="checkbox" ${s.enabled!==false?'checked':''}> Enabled</label></div></article>`).join('')+`<button id="saveSources">Save sources</button>`}
function newsCard(a){return `<article class="newsCardAdmin"><div class="newsThumb" style="${a.image?`background-image:url('${esc(a.image)}')`:''}"></div><div><h3>${esc(a.title)}</h3><p>${esc(a.sourceName)} · ${formatDate(a.publishedAt)}</p><div><span class="statusPill ${a.featured?'published':''}">${a.featured?'featured':'standard'}</span> ${a.pinned?'<span class="statusPill draft">pinned</span>':''} ${a.hidden?'<span class="statusPill">hidden</span>':''}</div></div><div class="newsCardActions"><button data-edit-news="${esc(a.id)}" class="secondary">Edit</button><button data-toggle-news="${esc(a.id)}" data-field="featured" class="secondary">${a.featured?'Unfeature':'Feature'}</button><button data-toggle-news="${esc(a.id)}" data-field="hidden" class="secondary">${a.hidden?'Show':'Hide'}</button>${a.manual?`<button data-delete-news="${esc(a.id)}" class="secondary">Delete</button>`:''}</div></article>`}
function renderPolls(){const polls=(state.modules||[]).filter(m=>m.type==='poll');$('pollList').innerHTML=polls.map(m=>contentCard(m)).join('')||'<p>No polls yet.</p>'}
function renderPlaylists(){const list=(state.modules||[]).filter(m=>m.type==='playlist');$('playlistList').innerHTML=list.map(m=>contentCard(m)).join('')||'<p>No playlists yet.</p>'}
function contentCard(m){return `<article class="contentCard"><span class="statusPill ${esc(m.status)}">${esc(m.status)}</span><h3>${esc(m.title)}</h3><p>${esc(m.description||'')}</p><button data-edit-module="${esc(m.id)}" class="secondary">Edit</button></article>`}
function renderTheme(){const active=state.core?.theme?.id||'weekend';$('themePicker').innerHTML=activeThemes().map(t=>`<button class="themeChoice ${t.id===active?'active':''}" data-select-theme="${esc(t.id)}" style="--theme-color:${themeColors[t.id]||'#55e5ff'}"><strong>${esc(t.title)}</strong><span>${esc(t.id)}</span></button>`).join('');const legacy=state.legacy||{};$('topTickerEditor').innerHTML=(legacy.topTicker||[]).map((x,i)=>tickerRow(x,i,false)).join('');$('themeTickerEditor').innerHTML=(legacy.themeTicker||[]).map((x,i)=>tickerRow(x,i,true)).join('')}
function tickerRow(item={},i,themeSpecific=false){return `<div class="simpleRow" data-ticker-kind="${themeSpecific?'theme':'top'}">${themeSpecific?`<select data-ticker-field="theme">${themeOptions(item.theme||'weekend',false)}</select>`:`<span>General</span>`}<input data-ticker-field="text" value="${esc(item.text||'')}" placeholder="Write ticker message"><button data-remove-ticker="${themeSpecific?'theme':'top'}" data-index="${i}" class="secondary">Delete</button></div>`}
function readTickers(kind){return [...document.querySelectorAll(`[data-ticker-kind="${kind}"]`)].map((row,i)=>({id:`${kind}-${i+1}`,theme:row.querySelector('[data-ticker-field="theme"]')?.value||'all',enabled:true,text:row.querySelector('[data-ticker-field="text"]').value}))}
async function saveTickers(){try{const result=await api('/api/cms/admin/tickers',{method:'POST',body:JSON.stringify({topTicker:readTickers('top'),themeTicker:readTickers('theme')})});state.legacy=result.legacy;toast('Ticker messages saved.')}catch(error){toast(error.message,true)}}
function renderSchedule(){const modules=state.modules||[],now=Date.now();const active=modules.filter(m=>m.status==='published'&&(!m.schedule?.startsAt||new Date(m.schedule.startsAt)<=new Date())&&(!m.schedule?.endsAt||new Date(m.schedule.endsAt)>=new Date()));const scheduled=modules.filter(m=>m.schedule?.startsAt&&new Date(m.schedule.startsAt).getTime()>now);const drafts=modules.filter(m=>m.status==='draft');$('scheduleBoard').innerHTML=[['Live now',active],['Scheduled',scheduled],['Drafts',drafts]].map(([title,list])=>`<section class="scheduleColumn"><h3>${title}</h3>${list.map(m=>`<div class="scheduleItem"><strong>${esc(m.title)}</strong><small>${m.schedule?.startsAt?formatDate(m.schedule.startsAt):esc(m.type)}</small></div>`).join('')||'<p>Nothing here.</p>'}</section>`).join('')}
function openContentEditor(type,module=null){const m=module||{type,title:'',description:'',theme:'all',showId:'all',status:'draft',surfaces:{website:true,overlay:false},placement:{websiteZone:type==='poster'?'featured':'editorial'},schedule:{},display:{pinned:false},content:{},media:{}};$('contentId').value=m.id||'';$('contentType').value=type;$('modalKicker').textContent=type.replace('-',' ').toUpperCase();$('modalTitle').textContent=m.id?'Edit content':'Create content';$('contentStatus').value=m.status||'draft';$('contentTheme').innerHTML=themeOptions(m.theme||'all');$('contentShow').innerHTML=showOptions(m.showId||'all');$('contentZone').value=m.placement?.websiteZone||'editorial';$('contentStart').value=toLocalInput(m.schedule?.startsAt);$('contentEnd').value=toLocalInput(m.schedule?.endsAt);$('contentWebsite').checked=m.surfaces?.website!==false;$('contentOverlay').checked=!!m.surfaces?.overlay;$('contentPinned').checked=!!m.display?.pinned;$('contentFields').innerHTML=buildContentFields(type,m);$('editorModal').classList.add('open');$('editorModal').setAttribute('aria-hidden','false')}
function buildContentFields(type,m){const c=m.content||{},media=m.media||{};const common=`<section class="fieldSection"><h3>Basic information</h3><label>Title<input id="fieldTitle" value="${esc(m.title||'')}"></label><label>Short introduction<textarea id="fieldDescription">${esc(m.description||'')}</textarea></label></section>`;const image=`<section class="fieldSection"><h3>Image</h3><label class="imageDrop cmsContentDrop"><span>Click or drop an image</span>${media.image?`<img src="${esc(media.image)}">`:''}<input id="fieldImageFile" type="file" accept="image/*"></label><label>Or paste an image address<input id="fieldImageUrl" value="${esc(media.image||'')}"></label></section>`;if(type==='poster')return common+image+`<section class="fieldSection"><h3>Event details</h3><div class="twoCols"><label>Date or label<input id="fieldEventDate" value="${esc(c.dateLabel||'')}"></label><label>Button text<input id="fieldCtaLabel" value="${esc(c.ctaLabel||'Read more')}"></label></div><label>Button link<input id="fieldCtaUrl" value="${esc(c.ctaUrl||'')}"></label><label>Full event text<textarea id="fieldBody">${esc(c.body||'')}</textarea></label></section>`;if(type==='ranked-list'){const items=c.items||Array.from({length:10},(_,i)=>({rank:i+1}));return common+`<section class="fieldSection"><h3>Countdown size</h3><select id="fieldListSize"><option value="10" ${items.length<=10?'selected':''}>Top 10</option><option value="20" ${items.length>10?'selected':''}>Top 20</option></select></section><section class="fieldSection"><h3>Tracks</h3><div id="rankedBuilder" class="listBuilder">${items.map((x,i)=>rankedBuilderRow(x,i)).join('')}</div><button type="button" id="resizeRanked" class="secondary">Apply size</button></section>`}if(type==='story')return common+image+`<section class="fieldSection"><h3>Article</h3><label>Full story<textarea id="fieldBody" style="min-height:240px">${esc(c.body||'')}</textarea></label><label>Read-more link<input id="fieldCtaUrl" value="${esc(c.ctaUrl||'')}"></label></section>`;if(type==='poll'){const options=c.options||[{id:'a',label:''},{id:'b',label:''}];return common+`<section class="fieldSection"><h3>Question and answers</h3><label>Question<input id="fieldQuestion" value="${esc(c.question||'')}"></label><div id="pollBuilder" class="listBuilder">${options.map((o,i)=>pollBuilderRow(o,i)).join('')}</div><button type="button" id="addPollOption" class="secondary">Add answer</button></section>`}if(type==='playlist')return common+image+`<section class="fieldSection"><h3>Playlist</h3><label>Spotify or playlist link<input id="fieldPlaylistUrl" value="${esc(c.url||'')}"></label><label>Button text<input id="fieldCtaLabel" value="${esc(c.ctaLabel||'Open playlist')}"></label><label>About this playlist<textarea id="fieldBody">${esc(c.body||'')}</textarea></label></section>`;return common+image+`<section class="fieldSection"><h3>Content</h3><label>Text<textarea id="fieldBody">${esc(c.body||'')}</textarea></label></section>`}
function rankedBuilderRow(x={},i){return `<div class="listBuilderRow" data-ranked-row><input data-rank value="${i+1}" disabled><input data-artist placeholder="Artist" value="${esc(x.artist||'')}"><input data-title placeholder="Track title" value="${esc(x.title||'')}"><button type="button" data-remove-builder class="secondary">×</button><input data-year placeholder="Year" value="${esc(x.year||'')}"><textarea data-story placeholder="Short story">${esc(x.story||'')}</textarea></div>`}
function pollBuilderRow(o={},i){return `<div class="listBuilderRow" data-poll-row><input value="${String.fromCharCode(65+i)}" disabled><input data-option-label placeholder="Answer" value="${esc(o.label||'')}"><button type="button" data-remove-builder class="secondary">×</button></div>`}
async function uploadFile(file){if(!file)return'';if(!state.media?.r2Ready){toast('Image upload needs the Cloudflare R2 binding DJF_MEDIA. You can paste an image address instead.',true);return''}const base64=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.onerror=reject;r.readAsDataURL(file)});const result=await api('/api/content/admin/media',{method:'POST',body:JSON.stringify({filename:file.name,mimeType:file.type,base64})});return result.url}
async function collectModule(statusOverride=null){const type=$('contentType').value;let image=$('fieldImageUrl')?.value||'';const file=$('fieldImageFile')?.files?.[0];if(file)image=await uploadFile(file)||image;const content={};if($('fieldBody'))content.body=$('fieldBody').value;if($('fieldCtaUrl'))content.ctaUrl=$('fieldCtaUrl').value;if($('fieldCtaLabel'))content.ctaLabel=$('fieldCtaLabel').value;if($('fieldEventDate'))content.dateLabel=$('fieldEventDate').value;if($('fieldPlaylistUrl'))content.url=$('fieldPlaylistUrl').value;if(type==='ranked-list')content.items=[...document.querySelectorAll('[data-ranked-row]')].map((r,i)=>({rank:i+1,artist:r.querySelector('[data-artist]').value,title:r.querySelector('[data-title]').value,year:r.querySelector('[data-year]').value,story:r.querySelector('[data-story]').value}));if(type==='poll'){content.question=$('fieldQuestion').value;content.options=[...document.querySelectorAll('[data-poll-row]')].map((r,i)=>({id:String.fromCharCode(97+i),label:r.querySelector('[data-option-label]').value,votes:0})).filter(o=>o.label)}return{id:$('contentId').value,type,title:$('fieldTitle').value,description:$('fieldDescription').value,theme:$('contentTheme').value,showId:$('contentShow').value,status:statusOverride||$('contentStatus').value,surfaces:{website:$('contentWebsite').checked,overlay:$('contentOverlay').checked},placement:{websiteZone:$('contentZone').value,overlayZone:`separate-${type}`},schedule:{startsAt:$('contentStart').value?new Date($('contentStart').value).toISOString():null,endsAt:$('contentEnd').value?new Date($('contentEnd').value).toISOString():null},display:{pinned:$('contentPinned').checked,label:type.replace('-',' ')},content,media:{image}}}
async function saveModule(statusOverride=null){try{const module=await collectModule(statusOverride);const result=await api('/api/content/admin/module',{method:'POST',body:JSON.stringify({module})});const index=(state.modules||[]).findIndex(m=>m.id===result.module.id);if(index>=0)state.modules[index]=result.module;else state.modules.unshift(result.module);closeModal();renderAll();toast(statusOverride==='draft'?'Draft saved.':'Content saved.')}catch(error){toast(error.message,true)}}
function openNewsEditor(article=null){const a=article||{};$('contentId').value=a.id||'';$('contentType').value='manual-news';$('modalKicker').textContent='MUSIC STORY';$('modalTitle').textContent=a.id?'Edit story':'Write a story';$('contentFields').innerHTML=`<section class="fieldSection"><h3>Story</h3><label>Headline<input id="newsTitleField" value="${esc(a.title||'')}"></label><label>Short summary<textarea id="newsSummaryField">${esc(a.summary||'')}</textarea></label><label>Image address<input id="newsImageField" value="${esc(a.image||'')}"></label><label>Link to full story<input id="newsLinkField" value="${esc(a.link||'')}"></label><div class="threeCols"><label>Theme<select id="newsThemeField">${themeOptions(a.customTheme||'all')}</select></label><label>Publish date<input id="newsDateField" type="datetime-local" value="${toLocalInput(a.publishedAt)}"></label><label>Source name<input id="newsSourceField" value="${esc(a.sourceName||'DJ FOLSOE Editorial')}"></label></div><div class="switchRow"><label><input id="newsFeaturedField" type="checkbox" ${a.featured?'checked':''}> Feature story</label><label><input id="newsPinnedField" type="checkbox" ${a.pinned?'checked':''}> Pin story</label><label><input id="newsOverlayField" type="checkbox" ${a.overlay?'checked':''}> Offer to news OBS widget</label></div></section>`;document.querySelector('.publishingPanel').style.display='none';$('editorModal').classList.add('open');$('editorModal').setAttribute('aria-hidden','false')}
async function saveNewsStory(){try{const article={id:$('contentId').value,title:$('newsTitleField').value,summary:$('newsSummaryField').value,image:$('newsImageField').value,link:$('newsLinkField').value,customTheme:$('newsThemeField').value,publishedAt:$('newsDateField').value?new Date($('newsDateField').value).toISOString():new Date().toISOString(),sourceName:$('newsSourceField').value,featured:$('newsFeaturedField').checked,pinned:$('newsPinnedField').checked,overlay:$('newsOverlayField').checked};const result=await api('/api/cms/admin/news',{method:'POST',body:JSON.stringify({article})});const i=state.news.articles.findIndex(a=>a.id===result.article.id);if(i>=0)state.news.articles[i]=result.article;else state.news.articles.unshift(result.article);closeModal();renderNews();renderDashboard();toast('Music story saved.')}catch(error){toast(error.message,true)}}
function closeModal(){$('editorModal').classList.remove('open');$('editorModal').setAttribute('aria-hidden','true');document.querySelector('.publishingPanel').style.display='';$('contentForm').reset()}
function confirmAction(title,text,callback){pendingConfirm=callback;$('confirmTitle').textContent=title;$('confirmText').textContent=text;$('confirmModal').hidden=false}
async function deleteModule(id){confirmAction('Delete this content?','The block will disappear from admin and the website.',async()=>{try{await api('/api/content/admin/module?id='+encodeURIComponent(id),{method:'DELETE'});state.modules=state.modules.filter(m=>m.id!==id);renderAll();toast('Content deleted.')}catch(error){toast(error.message,true)}})}
async function duplicateModule(id){try{const result=await api('/api/cms/admin/module/duplicate',{method:'POST',body:JSON.stringify({id})});state.modules.unshift(result.module);renderAll();toast('A draft copy was created.')}catch(error){toast(error.message,true)}}
async function setTheme(id){try{const result=await api('/api/cms/admin/theme',{method:'POST',body:JSON.stringify({theme:id})});state.core=result.core;renderTheme();renderDashboard();toast(`${result.theme.title} is now active.`)}catch(error){toast(error.message,true)}}
async function toggleNews(id,field){const a=state.news.articles.find(x=>x.id===id);if(!a)return;try{const result=await api('/api/news/admin/article',{method:'POST',body:JSON.stringify({id,patch:{[field]:!a[field]}})});Object.assign(a,result.article);renderNews();toast('Story updated.')}catch(error){toast(error.message,true)}}
async function deleteNews(id){confirmAction('Delete this story?','This cannot be undone.',async()=>{try{await api('/api/cms/admin/news?id='+encodeURIComponent(id),{method:'DELETE'});state.news.articles=state.news.articles.filter(a=>a.id!==id);renderNews();toast('Story deleted.')}catch(error){toast(error.message,true)}})}
async function saveSources(){try{const sources=[...document.querySelectorAll('[data-source-index]')].map((row,i)=>({id:state.news.sources[i]?.id||`source-${i}`,name:row.querySelector('[data-source-field="name"]').value,url:row.querySelector('[data-source-field="url"]').value,priority:Number(row.querySelector('[data-source-field="priority"]').value),enabled:row.querySelector('[data-source-field="enabled"]').checked}));const result=await api('/api/news/admin/sources',{method:'POST',body:JSON.stringify({sources})});state.news.sources=result.sources;toast('News sources saved.')}catch(error){toast(error.message,true)}}
document.addEventListener('click',async event=>{const el=event.target.closest('button,a,summary');if(!el)return;if(el.dataset.screen)openScreen(el.dataset.screen);if(el.dataset.composerToggle)toggleSceneComposerLayer(el.dataset.composerToggle);if(el.dataset.composerPreview)previewSceneComposerLayer(el.dataset.composerPreview);if(el.dataset.screenJump)openScreen(el.dataset.screenJump);if(el.dataset.quickCreate)openWizard(el.dataset.quickCreate);if(el.dataset.editModule){const m=state.modules.find(x=>x.id===el.dataset.editModule);if(m)openContentEditor(m.type,m)}if(el.dataset.duplicateModule)duplicateModule(el.dataset.duplicateModule);if(el.dataset.deleteModule)deleteModule(el.dataset.deleteModule);
if(el.dataset.togglePublish)quickToggleModule(el.dataset.togglePublish,{status:state.modules.find(m=>m.id===el.dataset.togglePublish)?.status==='published'?'draft':'published'});
if(el.dataset.toggleWebsite){const m=state.modules.find(x=>x.id===el.dataset.toggleWebsite);quickToggleModule(el.dataset.toggleWebsite,{website:!(m?.surfaces?.website!==false)});}
if(el.dataset.closeWizard!==undefined)closeWizard();
if(el.dataset.wizardType){wizardState.type=el.dataset.wizardType;wizardState.step=1;renderWizardStep();}
if(el.dataset.removeWizardRow!==undefined)el.closest('.wizardTrackRow,.wizardPollRow')?.remove();
if(el.dataset.closeModal!==undefined)closeModal();if(el.dataset.moduleFilter){currentModuleFilter=el.dataset.moduleFilter;document.querySelectorAll('[data-module-filter]').forEach(b=>b.classList.toggle('active',b===el));renderModules()}if(el.dataset.newsTab){document.querySelectorAll('[data-news-tab]').forEach(b=>b.classList.toggle('active',b===el));document.querySelectorAll('.newsPanel').forEach(p=>p.classList.toggle('active',p.id===`news${el.dataset.newsTab[0].toUpperCase()+el.dataset.newsTab.slice(1)}`))}if(el.dataset.selectTheme)setTheme(el.dataset.selectTheme);if(el.dataset.editNews){const a=state.news.articles.find(x=>x.id===el.dataset.editNews);openNewsEditor(a)}if(el.dataset.toggleNews)toggleNews(el.dataset.toggleNews,el.dataset.field);if(el.dataset.deleteNews)deleteNews(el.dataset.deleteNews);if(el.dataset.removeBuilder!==undefined)el.closest('[data-ranked-row],[data-poll-row]')?.remove();if(el.id==='addPollOption')$('pollBuilder').insertAdjacentHTML('beforeend',pollBuilderRow({},document.querySelectorAll('[data-poll-row]').length));if(el.id==='resizeRanked'){const size=Number($('fieldListSize').value);const current=[...document.querySelectorAll('[data-ranked-row]')].map((r,i)=>({artist:r.querySelector('[data-artist]').value,title:r.querySelector('[data-title]').value,year:r.querySelector('[data-year]').value,story:r.querySelector('[data-story]').value}));$('rankedBuilder').innerHTML=Array.from({length:size},(_,i)=>rankedBuilderRow(current[i]||{},i)).join('')}if(el.dataset.moveShow!==undefined){const list=readShows(),i=Number(el.dataset.moveShow),to=i+Number(el.dataset.dir);if(to>=0&&to<list.length){[list[i],list[to]]=[list[to],list[i]];state.core.featuredShows=list;renderShows()}}if(el.dataset.removeShow!==undefined){state.core.featuredShows=readShows().filter((_,i)=>i!==Number(el.dataset.removeShow));renderShows()}if(el.dataset.chartStory!==undefined){const row=document.querySelector(`[data-chart-index="${el.dataset.chartStory}"]`),input=row.querySelector('[data-chart-field="story"]');input.value=prompt('Write a short story about this track:',input.value)||input.value}if(el.dataset.removeTicker){el.closest('.simpleRow').remove()}});
document.addEventListener('change',async event=>{const el=event.target;if(el.matches('[data-show-image]')){const url=await uploadFile(el.files[0]);if(url){const card=el.closest('[data-show-index]');card.querySelector('[data-show-field="image"]').value=url;state.core.featuredShows=readShows();renderShows()}}if(el.matches('[data-chart-image]')){const url=await uploadFile(el.files[0]);if(url){const row=el.closest('[data-chart-index]');row.querySelector('[data-chart-field="cover"]').value=url;renderChart()}}});
['heroEyebrowInput','heroTitleInput','heroSubtitleInput','heroTextInput'].forEach(id=>$(id).addEventListener('input',updateHomepagePreview));
$('loadCms').onclick=connect;$('saveHomepage').onclick=saveHomepage;$('addShow').onclick=()=>{state.core.featuredShows=[...(state.core.featuredShows||[]),{title:'New show',time:'Special',description:'',theme:'weekend',color:'#55e5ff'}];renderShows()};$('saveShows').onclick=saveShows;$('chartSize').onchange=renderChart;$('saveChart').onclick=saveChart;$('newStory').onclick=()=>openNewsEditor();$('refreshNews').onclick=async()=>{try{await api('/api/news/admin/refresh',{method:'POST',body:'{}'});state=await api('/api/cms/admin/state');renderNews();renderDashboard();toast('External music stories refreshed.')}catch(error){toast(error.message,true)}};$('saveTickers').onclick=saveTickers;$('addTopTicker').onclick=()=>{$('topTickerEditor').insertAdjacentHTML('beforeend',tickerRow({},document.querySelectorAll('[data-ticker-kind="top"]').length,false))};$('addThemeTicker').onclick=()=>{$('themeTickerEditor').insertAdjacentHTML('beforeend',tickerRow({},document.querySelectorAll('[data-ticker-kind="theme"]').length,true))};$('contentForm').onsubmit=event=>{event.preventDefault();if($('contentType').value==='manual-news')saveNewsStory();else saveModule('published')};$('saveDraft').onclick=()=>{if($('contentType').value==='manual-news')saveNewsStory();else saveModule('draft')};$('confirmCancel').onclick=()=>{$('confirmModal').hidden=true;pendingConfirm=null};$('confirmOk').onclick=async()=>{const fn=pendingConfirm;$('confirmModal').hidden=true;pendingConfirm=null;if(fn)await fn()};document.addEventListener('click',e=>{if(e.target.id==='saveSources')saveSources()});
const savedToken=localStorage.getItem('djf_cms_token');if(savedToken)$('adminToken').value=savedToken;


/* =========================================================
   V1002 BROADCAST CONTROL ROOM STATUS + SAFE BOOT
   ========================================================= */
function v1002SetStatus(id,text,mode='online'){
  const value=document.getElementById(id); if(value)value.textContent=text;
  const dot=document.getElementById(id+'Dot'); if(dot){dot.classList.remove('online','warning');dot.classList.add(mode)}
}
async function v1002PublicHealth(){
  v1002SetStatus('statusWebsite','Online');
  try{
    const health=await fetch(API+'/api/content/health?t='+Date.now(),{cache:'no-store'}).then(r=>r.json());
    v1002SetStatus('statusWorker',health.ok?'Online':'Attention',health.ok?'online':'warning');
    const version=document.getElementById('statusWorkerVersion'); if(version)version.textContent=health.version||'Content Core';
  }catch(_){v1002SetStatus('statusWorker','Unavailable','warning')}
}
function v1002RenderConnectedStatus(){
  if(!state)return;
  const core=state.core||{},twitch=core.twitch||{},theme=core.theme||{};
  v1002SetStatus('statusWebsite','Online');
  v1002SetStatus('statusWorker','Online');
  v1002SetStatus('statusTwitch',twitch.live||twitch.isLive?'Live now':'Connected');
  v1002SetStatus('statusNews',String(state.news?.articles?.length||0)+' stories');
  v1002SetStatus('statusOverlay','Protected');
  const twitchDetail=document.getElementById('statusTwitchDetail');if(twitchDetail)twitchDetail.textContent=(twitch.viewers||0)+' viewers · '+(twitch.followers||0)+' followers';
  const newsDetail=document.getElementById('statusNewsDetail');if(newsDetail)newsDetail.textContent=(state.news?.articles?.filter(a=>a.manual).length||0)+' editorial · '+(state.news?.articles?.filter(a=>!a.manual).length||0)+' external';
  const title=document.getElementById('controlNowTitle');if(title)title.textContent=core.show?.title||core.show?.current||twitch.title||'DJ FOLSOE NETWORK';
  const detail=document.getElementById('controlNowDetail');if(detail)detail.textContent=twitch.live||twitch.isLive?'The channel is live. Website and shared content are using the current broadcast state.':'The channel is currently offline. You can prepare and schedule content safely.';
  const themeNode=document.getElementById('controlTheme');if(themeNode)themeNode.textContent=theme.title||theme.id||'Music TV';
  const viewers=document.getElementById('controlViewers');if(viewers)viewers.textContent=Number(twitch.viewers||0).toLocaleString();
  const followers=document.getElementById('controlFollowers');if(followers)followers.textContent=Number(twitch.followers||core.community?.followers||0).toLocaleString();
}
const v1002OriginalRenderAll=renderAll;
renderAll=function(){v1002OriginalRenderAll();v1002RenderConnectedStatus()};
document.addEventListener('DOMContentLoaded',()=>{
  const confirm=document.getElementById('confirmModal');if(confirm)confirm.hidden=true;
  const editor=document.getElementById('editorModal');if(editor){editor.classList.remove('open');editor.setAttribute('aria-hidden','true')}
  v1002PublicHealth();
  const saved=localStorage.getItem('djf_cms_token');
  if(saved){document.getElementById('adminToken').value=saved;setTimeout(()=>document.getElementById('loadCms')?.click(),180)}
});

document.addEventListener('DOMContentLoaded',async()=>{
  const modal=document.getElementById('editorModal');
  const confirm=document.getElementById('confirmModal');
  if(modal){modal.classList.remove('open');modal.setAttribute('aria-hidden','true')}
  if(confirm)confirm.hidden=true;
  $('retryConnection')?.addEventListener('click',()=>connect());
  $('forgetPassword')?.addEventListener('click',()=>{
    localStorage.removeItem('djf_cms_token');$('adminToken').value='';
    $('cmsScreens').hidden=true;$('loadingState').hidden=false;hideConnectionPanel();
    $('connectionDot').classList.remove('online');$('connectionText').textContent='Not connected';
    toast('Saved admin password removed.');
  });
  await preflight();
  if(localStorage.getItem('djf_cms_token'))await connect({silent:true});
});

document.addEventListener('DOMContentLoaded',()=>{
  $('wizardBack')?.addEventListener('click',()=>{wizardState.step=0;renderWizardStep()});
  $('wizardNext')?.addEventListener('click',()=>{if(!$('wizardContentTitle')?.value.trim())return toast('Write a title first.',true);wizardState.step=2;renderWizardStep()});
  $('wizardPlacementBack')?.addEventListener('click',()=>{wizardState.step=1;renderWizardStep()});
  $('wizardPlacementNext')?.addEventListener('click',()=>{wizardState.step=3;renderWizardStep()});
  $('wizardPublishBack')?.addEventListener('click',()=>{wizardState.step=2;renderWizardStep()});
  $('wizardSave')?.addEventListener('click',finishWizard);
  document.querySelectorAll('input[name="wizardPublishMode"]').forEach(input=>input.addEventListener('change',()=>{
    $('wizardScheduleFields').hidden=document.querySelector('input[name="wizardPublishMode"]:checked')?.value!=='scheduled';
  }));
});

document.addEventListener('DOMContentLoaded',()=>{
  document.getElementById('composerSaveLocal')?.addEventListener('click',saveSceneComposerLocal);
  document.getElementById('composerReset')?.addEventListener('click',resetSceneComposer);
  ['composerUrlMain','composerUrlTopTicker','composerUrlBottomTicker','composerUrlChat'].forEach(id=>document.getElementById(id)?.addEventListener('change',saveSceneComposerLocal));
});

document.addEventListener('visibilitychange',()=>{
  if(!document.hidden&&state)v1700Refresh();
});

window.addEventListener('online',()=>{
  if(state)v1700Refresh();
});

document.addEventListener('visibilitychange',()=>{
  if(!document.hidden&&state)v1701Refresh();
});

window.addEventListener('online',()=>{
  if(state)v1701Refresh();
});
