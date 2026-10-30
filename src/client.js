// Bundled by scripts/build.mjs, using EVA's documented module-loader contract.
window.__ModuleLoader__.load({
  id: 'dsh-plugin-01-wallpaper',
  factory: () => ({
    name: 'dsh-plugin-01-wallpaper',
    inject: ['theme'],
    apply(ctx) {
      ctx.effect(() => ctx.theme.overrideTokens('dsh-plugin-01-wallpaper', themeTokens()), 'zero-one: monochrome theme tokens');
      ctx.effect(() => {
        let mounted = null, frame = 0, disposed = false, region = null;
        let brandHost = null, brand = null, chassis = null;
        let arrivalTimer = null, arrivalPlayed = false, hadStartup = false, shellAnimations = [];
        const startupVisible = () => [...document.querySelectorAll('iframe[title="DSH startup animation"],#dsh-startup-root:not(.dsu-gone)')]
          .some(el => !el.hidden && getComputedStyle(el).display !== 'none' && el.getBoundingClientRect().width > 0);
        const stopArrival = () => {
          clearTimeout(arrivalTimer); arrivalTimer = null;
          mounted?.cancelEntrance();
          for (const animation of shellAnimations) animation.cancel();
          shellAnimations = [];
        };
        const reduced = matchMedia('(prefers-reduced-motion: reduce)');
        const style = document.createElement('style');
        style.id = 'zero-one-theme-styles';
        style.textContent = THEME_CSS;
        document.head.appendChild(style);
        document.documentElement.setAttribute('data-zero-one-theme', '');
        const resize = new ResizeObserver(schedule);
        let observed = [];
        function observeLayout(elements) {
          const next = elements.filter(Boolean);
          if (next.length === observed.length && next.every((el,i) => el === observed[i])) return;
          resize.disconnect(); observed = next;
          for (const element of observed) resize.observe(element);
        }
        function sync() {
          frame = 0;
          if (disposed) return;
          const next = document.querySelector('[data-conversation-region]');
          const parent = document.getElementById('root');
          const startup = startupVisible();
          if (startup) { stopArrival(); arrivalPlayed = false; }
          const justExitedStartup = hadStartup && !startup;
          hadStartup = startup;
          if (parent && !chassis?.isConnected) {
            chassis?.remove();
            chassis = document.createElement('div');
            chassis.className = 'zero-one-chassis';
            chassis.setAttribute('aria-hidden', 'true');
            chassis.innerHTML = '<i class="chassis-corner"></i><i class="chassis-corner"></i><i class="chassis-corner"></i><i class="chassis-corner"></i><div class="chassis-bottom"></div><div class="chassis-track"><i></i></div>';
            parent.append(chassis);
          }
          const active = !!next?.querySelector('[data-turn-process]');
          const modal = !!document.querySelector('[role="dialog"][aria-modal="true"]:not([hidden]):not([aria-hidden="true"])');
          if (chassis) chassis.dataset.paused = String(document.hidden || reduced.matches || active || modal || startup || !next);
          const sidebar = document.querySelector('[data-slot="sidebar"]');
          const sidebarWidth = document.querySelector('[class*="_sidebarCol"]')?.getBoundingClientRect().width || sidebar?.getBoundingClientRect().width || 0;
          chassis?.style.setProperty('--zero-one-sidebar', sidebarWidth + 'px');
          const nextBrand = sidebar?.querySelector('[class*="_brandIdentity"]');
          if (nextBrand !== brandHost || (brandHost && !brand?.isConnected)) {
            brand?.remove(); brandHost?.removeAttribute('data-zero-one-brand'); brandHost = nextBrand; brand = null;
            if (brandHost) {
              brand = document.createElement('span'); brand.className = 'zero-one-sidebar-brand';
              brand.innerHTML = '<span><strong>零一 AI 日新社</strong><small>01 / MEMBER WORKSPACE</small></span>';
              brandHost.setAttribute('data-zero-one-brand', ''); brandHost.append(brand);
            }
          }
          if (next !== region) { region?.removeAttribute('data-zero-one-wallpaper-ready'); region = next; }
          if (!region || !parent) { observeLayout([]); mounted?.dispose(); mounted = null; return; }
          if (mounted && mounted.host.parentNode !== parent) { mounted.dispose(); mounted = null; }
          if (!mounted) {
            mounted = mountWallpaper(parent, { logo: LOGO, css: CSS });
            mounted.host.style.position = 'fixed';
            mounted.host.style.zIndex = '10';
            mounted.host.dataset.integrated = 'true';
          }
          region.setAttribute('data-zero-one-wallpaper-ready', '');
          const box = region.getBoundingClientRect();
          const header = document.querySelector('[data-conversation-header]');
          const composer = document.querySelector('[data-composer-card]');
          observeLayout([region, header, composer]);
          const headerBox = header?.getBoundingClientRect();
          const composerBox = composer?.getBoundingClientRect();
          const top = headerBox?.height ? Math.max(box.top, headerBox.bottom) : box.top;
          const hidden = box.width < 1 || box.height < 1 || modal || startup ||
            !!document.querySelector('[data-sidebar-right-open][data-sidebar-right-panel="fullscreen"]');
          mounted.host.style.display = hidden ? 'none' : 'block';
          mounted.host.style.left = box.left + 'px';
          mounted.host.style.top = top + 'px';
          mounted.host.style.width = box.width + 'px';
          mounted.host.style.height = Math.max(0, box.bottom - top) + 'px';
          mounted.host.style.right = 'auto'; mounted.host.style.bottom = 'auto';
          mounted.host.dataset.active = String(active);
          mounted.setInputExclusion(composerBox?.height ? {
            left:composerBox.left-box.left-8, top:composerBox.top-top-18,
            right:composerBox.right-box.left+8, bottom:composerBox.bottom-top+8,
          } : null);
          mounted.setHeroPosition(composerBox?.height ? Math.max(66, composerBox.top-top-82) : Math.max(66,(box.height)*.28));
          mounted.setMotion(!active && !hidden);
          if (active && !startup) arrivalPlayed = true;
          if (hidden || document.hidden || parent.inert || active) stopArrival();
          else if (!arrivalPlayed && !arrivalTimer) {
            arrivalTimer = setTimeout(() => {
              arrivalTimer = null;
              if (disposed || !mounted || document.hidden || parent.inert || startupVisible() || mounted.host.style.display === 'none' || mounted.host.dataset.active === 'true') return;
              arrivalPlayed = true;
              const played = mounted.playEntrance();
              if (played) {
                const sidebar = document.querySelector('[class*="_sidebarCol"]');
                const composer = document.querySelector('[data-composer-card]');
                for (const [el,transform,delay] of [[sidebar,'translateX(-12px)',0],[composer,'translateY(12px)',140]]) {
                  if(el) shellAnimations.push(el.animate([{transform,opacity:.7},{transform:'none',opacity:1}],{duration:600,delay,easing:'cubic-bezier(.23,1,.32,1)'}));
                }
              }
            }, justExitedStartup ? 80 : 650);
          }
        }
        function schedule() { if (!disposed && !frame) frame = requestAnimationFrame(sync); }
        const observer = new MutationObserver(records => {
          if (records.some(r => (r.attributeName !== 'class' || r.target.id === 'dsh-startup-root') && (!mounted || r.target !== mounted.host))) schedule();
        });
        observer.observe(document.documentElement, {childList:true,subtree:true,attributes:true,attributeFilter:['data-ds-dark-theme','data-sidebar-right-open','data-sidebar-right-panel','hidden','aria-hidden','class','inert']});
        window.addEventListener('resize', schedule);
        window.addEventListener('scroll', schedule, true);
        document.addEventListener('visibilitychange', schedule);
        reduced.addEventListener('change', schedule);
        schedule();
        return () => {
          disposed = true; stopArrival(); cancelAnimationFrame(frame); observer.disconnect(); resize.disconnect();
          window.removeEventListener('resize', schedule); window.removeEventListener('scroll', schedule, true);
          document.removeEventListener('visibilitychange', schedule); reduced.removeEventListener('change', schedule);
          mounted?.dispose(); region?.removeAttribute('data-zero-one-wallpaper-ready'); style.remove();
          brand?.remove(); brandHost?.removeAttribute('data-zero-one-brand'); chassis?.remove();
          document.documentElement.removeAttribute('data-zero-one-theme');
        };
      }, 'zero-one: ambient wallpaper');
    }
  })
});
