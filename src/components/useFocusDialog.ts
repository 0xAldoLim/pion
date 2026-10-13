import {useEffect,useRef,type RefObject} from 'react';

/** Keep keyboard focus in an open dialog and return it to the invoking control. */
export function useFocusDialog(ref:RefObject<HTMLElement|null>,open:boolean,onClose:()=>void,lockScroll=true){
  const close=useRef(onClose);close.current=onClose;
  useEffect(()=>{
    const dialog=ref.current;if(!open||!dialog)return;
    const previous=document.activeElement instanceof HTMLElement?document.activeElement:null;
    const previousOverflow=document.body.style.overflow;
    if(lockScroll)document.body.style.overflow='hidden';
    const controls=()=>Array.from(dialog.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]')).filter(el=>el.getClientRects().length&&!el.closest('[inert]'));
    (controls()[0]??dialog).focus();
    const handle=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){event.preventDefault();close.current();return;}
      if(event.key!=='Tab')return;
      const items=controls();const first=items[0];const last=items.at(-1);
      if(!first){event.preventDefault();dialog.focus();return;}
      if(event.shiftKey&&(document.activeElement===first||!dialog.contains(document.activeElement))){event.preventDefault();last?.focus();}
      else if(!event.shiftKey&&(document.activeElement===last||!dialog.contains(document.activeElement))){event.preventDefault();first.focus();}
    };
    document.addEventListener('keydown',handle);
    return()=>{document.removeEventListener('keydown',handle);if(lockScroll)document.body.style.overflow=previousOverflow;requestAnimationFrame(()=>{if(previous?.isConnected)previous.focus();});};
  },[open,ref,lockScroll]);
}
