// UI background v12 — self-contained jungle/leaf background, no external image dependency.
(function(){
  'use strict';

  function install(){
    if(document.getElementById('glass-bg-v12-style')) return;

    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1600" viewBox="0 0 900 1600">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#0b3b24"/>
          <stop offset="0.48" stop-color="#1d6540"/>
          <stop offset="1" stop-color="#092f1d"/>
        </linearGradient>
        <radialGradient id="glow1" cx="35%" cy="12%" r="65%">
          <stop offset="0" stop-color="#b9e7a9" stop-opacity=".46"/>
          <stop offset="1" stop-color="#b9e7a9" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="glow2" cx="76%" cy="72%" r="58%">
          <stop offset="0" stop-color="#8fd7a0" stop-opacity=".26"/>
          <stop offset="1" stop-color="#8fd7a0" stop-opacity="0"/>
        </radialGradient>
        <filter id="blur"><feGaussianBlur stdDeviation="16"/></filter>
      </defs>
      <rect width="900" height="1600" fill="url(#bg)"/>
      <rect width="900" height="1600" fill="url(#glow1)"/>
      <rect width="900" height="1600" fill="url(#glow2)"/>

      <!-- soft jungle bokeh -->
      <g opacity=".20" filter="url(#blur)" fill="#d8f2c9">
        <circle cx="120" cy="180" r="58"/><circle cx="760" cy="250" r="78"/>
        <circle cx="650" cy="860" r="68"/><circle cx="180" cy="1180" r="82"/>
      </g>

      <!-- top-left tropical leaves -->
      <g transform="translate(-55 70) rotate(-24 220 280)" opacity=".72">
        <ellipse cx="160" cy="210" rx="72" ry="190" fill="#4e9a63"/>
        <ellipse cx="260" cy="275" rx="62" ry="170" fill="#6ab67b"/>
        <ellipse cx="90" cy="350" rx="56" ry="155" fill="#367c4f"/>
        <path d="M160 45 L160 380 M260 110 L260 440 M90 195 L90 505" stroke="#d1efc7" stroke-opacity=".36" stroke-width="5"/>
      </g>

      <!-- top-right broad leaves -->
      <g transform="translate(650 40) rotate(23 100 260)" opacity=".68">
        <ellipse cx="90" cy="190" rx="78" ry="210" fill="#5aa66e"/>
        <ellipse cx="205" cy="310" rx="72" ry="190" fill="#2f7448"/>
        <path d="M90 -10 L90 405 M205 120 L205 500" stroke="#d7f2cf" stroke-opacity=".34" stroke-width="5"/>
      </g>

      <!-- middle side foliage -->
      <g transform="translate(-75 650) rotate(18 170 250)" opacity=".55">
        <ellipse cx="150" cy="160" rx="66" ry="180" fill="#5fae75"/>
        <ellipse cx="225" cy="330" rx="74" ry="190" fill="#2f7d4b"/>
        <path d="M150 -20 L150 345 M225 140 L225 520" stroke="#d7f2cf" stroke-opacity=".30" stroke-width="5"/>
      </g>
      <g transform="translate(720 760) rotate(-25 90 240)" opacity=".55">
        <ellipse cx="90" cy="190" rx="72" ry="195" fill="#63b077"/>
        <ellipse cx="165" cy="360" rx="62" ry="170" fill="#3c8655"/>
        <path d="M90 0 L90 390 M165 190 L165 530" stroke="#d7f2cf" stroke-opacity=".30" stroke-width="5"/>
      </g>

      <!-- bottom leaves -->
      <g transform="translate(35 1260) rotate(-12 180 180)" opacity=".72">
        <ellipse cx="125" cy="165" rx="72" ry="205" fill="#468f5d"/>
        <ellipse cx="280" cy="215" rx="80" ry="220" fill="#6bb67b"/>
        <path d="M125 -40 L125 370 M280 -5 L280 435" stroke="#daf4d0" stroke-opacity=".34" stroke-width="5"/>
      </g>
      <g transform="translate(610 1300) rotate(22 120 170)" opacity=".64">
        <ellipse cx="110" cy="150" rx="76" ry="200" fill="#387d4f"/>
        <ellipse cx="220" cy="220" rx="66" ry="180" fill="#63aa73"/>
        <path d="M110 -45 L110 360 M220 35 L220 405" stroke="#daf4d0" stroke-opacity=".30" stroke-width="5"/>
      </g>
    </svg>`;

    const dataUri='data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg);
    const style=document.createElement('style');
    style.id='glass-bg-v12-style';
    style.textContent=`
      html,body{min-height:100%;}
      html{background:#0b3b24!important;}
      body{
        background-color:#0b3b24!important;
        background-image:
          linear-gradient(180deg,rgba(4,24,13,.04),rgba(3,20,11,.16)),
          url("${dataUri}")!important;
        background-size:cover,cover!important;
        background-position:center center,center center!important;
        background-repeat:no-repeat,no-repeat!important;
        background-attachment:fixed,fixed!important;
      }
      body::before{content:none!important;display:none!important;background:none!important;}
      body::after{
        content:''!important;position:fixed!important;inset:0!important;z-index:0!important;pointer-events:none!important;
        background:
          radial-gradient(circle at 20% 10%,rgba(255,255,255,.10),transparent 28%),
          radial-gradient(circle at 82% 32%,rgba(187,238,174,.08),transparent 26%),
          linear-gradient(to bottom,rgba(2,19,10,.00),rgba(2,19,10,.08))!important;
      }
      #form-login,#halaman-beranda{position:relative!important;z-index:2!important;}
      .glass-v91-nav{z-index:8000!important;}
      .modal-overlay{z-index:9000!important;}
      #camera-ui{z-index:9999!important;}
      @media(max-width:768px){body{background-attachment:scroll,scroll!important;background-size:cover,cover!important;}}
    `;
    document.head.appendChild(style);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
