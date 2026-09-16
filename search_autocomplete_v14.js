// Waste search autocomplete v14 — suggests subcategories and starts weighing on selection.
(function(){
  'use strict';

  const $=(id)=>document.getElementById(id);

  function normalizeText(value){
    return String(value||'')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g,'')
      .toLowerCase()
      .trim();
  }

  function getItems(){
    const out=[];
    try{
      Object.entries(dbSubKategori||{}).forEach(([kategori,items])=>{
        (items||[]).forEach(item=>out.push({
          kategori,
          name:item.name,
          icon:item.icon||'♻️',
          haystack:normalizeText(`${item.name} ${kategori}`)
        }));
      });
    }catch(_){ }
    return out;
  }

  function injectStyle(){
    if($('waste-search-autocomplete-style')) return;
    const style=document.createElement('style');
    style.id='waste-search-autocomplete-style';
    style.textContent=`
      .waste-search-wrap{position:relative;width:100%;margin:0 0 18px;z-index:150}
      .waste-search-wrap #search-sampah{margin:0!important;padding-right:42px!important}
      .waste-search-clear{position:absolute;right:10px;top:50%;transform:translateY(-50%);width:30px;height:30px;border:0;border-radius:50%;background:#e8f7f2;color:#55756b;display:none;align-items:center;justify-content:center;font-size:15px;z-index:3}
      .waste-search-dropdown{position:absolute;left:0;right:0;top:calc(100% + 7px);display:none;max-height:min(340px,46vh);overflow:auto;background:#fff;border:1px solid #d7ece5;border-radius:18px;box-shadow:0 16px 38px rgba(24,92,71,.16);padding:7px;z-index:5000;-webkit-overflow-scrolling:touch}
      .waste-search-dropdown.open{display:block}
      .waste-search-result{width:100%;border:0;background:transparent;border-radius:13px;padding:10px 10px;display:grid;grid-template-columns:42px minmax(0,1fr) auto;gap:10px;align-items:center;text-align:left;color:#163c32;cursor:pointer}
      .waste-search-result:active,.waste-search-result.active{background:#eaf8f3}
      .waste-search-icon{width:42px;height:42px;border-radius:13px;background:#dff6ef;display:flex;align-items:center;justify-content:center;font-size:22px}
      .waste-search-main{min-width:0}
      .waste-search-name{font-size:13px;font-weight:850;line-height:1.2;color:#163c32;white-space:normal}
      .waste-search-category{font-size:10px;color:#73877f;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .waste-search-arrow{font-size:18px;color:#7b928a;padding-right:2px}
      .waste-search-empty{padding:14px 12px;color:#71837d;font-size:12px;text-align:center}
      .waste-search-hint{padding:8px 10px 6px;font-size:9px;text-transform:uppercase;letter-spacing:.06em;font-weight:800;color:#81938d}
    `;
    document.head.appendChild(style);
  }

  function init(){
    const input=$('search-sampah');
    if(!input || input.dataset.autocompleteV14==='1') return;
    input.dataset.autocompleteV14='1';
    injectStyle();

    const wrap=document.createElement('div');
    wrap.className='waste-search-wrap';
    input.parentNode.insertBefore(wrap,input);
    wrap.appendChild(input);

    const clear=document.createElement('button');
    clear.type='button';
    clear.className='waste-search-clear';
    clear.setAttribute('aria-label','Hapus pencarian');
    clear.textContent='✕';
    wrap.appendChild(clear);

    const dropdown=document.createElement('div');
    dropdown.className='waste-search-dropdown';
    dropdown.setAttribute('role','listbox');
    wrap.appendChild(dropdown);

    input.placeholder='Cari jenis sampah (misal: Kresek, Koran, PET)...';
    input.autocomplete='off';

    let activeIndex=-1;
    let currentResults=[];

    function close(){
      dropdown.classList.remove('open');
      activeIndex=-1;
    }

    function choose(item){
      if(!item) return;
      input.value=item.name;
      clear.style.display='flex';
      close();
      input.blur();
      if(typeof window.mulaiKamera==='function') window.mulaiKamera(item.name);
      else if(typeof mulaiKamera==='function') mulaiKamera(item.name);
    }

    function render(){
      const q=normalizeText(input.value);
      clear.style.display=q?'flex':'none';
      activeIndex=-1;

      if(!q){
        dropdown.innerHTML='';
        close();
        return;
      }

      const tokens=q.split(/\s+/).filter(Boolean);
      currentResults=getItems()
        .filter(item=>tokens.every(token=>item.haystack.includes(token)))
        .sort((a,b)=>{
          const an=normalizeText(a.name),bn=normalizeText(b.name);
          const aStart=an.startsWith(q)?0:1;
          const bStart=bn.startsWith(q)?0:1;
          if(aStart!==bStart) return aStart-bStart;
          return a.name.localeCompare(b.name,'id');
        })
        .slice(0,10);

      if(!currentResults.length){
        dropdown.innerHTML='<div class="waste-search-empty">Jenis sampah tidak ditemukan.</div>';
        dropdown.classList.add('open');
        return;
      }

      dropdown.innerHTML='<div class="waste-search-hint">Pilih jenis sampah</div>'+currentResults.map((item,i)=>`
        <button type="button" class="waste-search-result" role="option" data-index="${i}">
          <span class="waste-search-icon">${item.icon}</span>
          <span class="waste-search-main"><span class="waste-search-name">${item.name}</span><span class="waste-search-category">${item.kategori}</span></span>
          <span class="waste-search-arrow">›</span>
        </button>`).join('');
      dropdown.classList.add('open');

      dropdown.querySelectorAll('.waste-search-result').forEach(btn=>{
        btn.addEventListener('click',()=>choose(currentResults[Number(btn.dataset.index)]));
      });
    }

    function setActive(next){
      const buttons=[...dropdown.querySelectorAll('.waste-search-result')];
      if(!buttons.length) return;
      activeIndex=(next+buttons.length)%buttons.length;
      buttons.forEach((btn,i)=>btn.classList.toggle('active',i===activeIndex));
      buttons[activeIndex].scrollIntoView({block:'nearest'});
    }

    input.addEventListener('input',render);
    input.addEventListener('focus',()=>{ if(input.value.trim()) render(); });
    input.addEventListener('keydown',(e)=>{
      if(!dropdown.classList.contains('open')) return;
      if(e.key==='ArrowDown'){e.preventDefault();setActive(activeIndex+1);}
      else if(e.key==='ArrowUp'){e.preventDefault();setActive(activeIndex-1);}
      else if(e.key==='Enter' && activeIndex>=0){e.preventDefault();choose(currentResults[activeIndex]);}
      else if(e.key==='Escape'){close();}
    });

    clear.addEventListener('click',()=>{
      input.value='';
      clear.style.display='none';
      close();
      input.focus();
    });

    document.addEventListener('pointerdown',(e)=>{
      if(!wrap.contains(e.target)) close();
    });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
