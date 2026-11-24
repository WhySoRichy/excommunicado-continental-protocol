import type { GearId, LoadoutSlot, UpgradeId, WeaponId } from '../combat/weapons';
import type { Action } from '../core/actions';
import type { Profile } from '../core/Save';
import { WEAPON_MODEL } from '../entities/PlayerViews';
import {
  type ArmoryItem,
  armoryItems,
  cycleOwned,
  gearStats,
  itemId,
  itemShop,
  itemState,
  type ItemState,
  LOADOUT_SLOTS,
  ownedCount,
  UPGRADE_ITEMS,
  weaponStats,
} from '../hub/armory';
import { canBuy, SHOP } from '../hub/economy';
import { ITEM_DESC, ITEM_NAMES, LOADOUT_TEXT } from '../text/loadout';
import { button, h, keycap } from './dom';
import type { WeaponPreview } from './weaponPreview';

/** Lo que necesitan las pantallas del equipo del resto del juego. */
export interface LoadoutApi {
  profile(): Profile;
  onBuy(id: UpgradeId): void;
  onEquip(slot: LoadoutSlot, id: WeaponId | GearId | null): void;
  label(a: Action): string;
}

/** Estado de la armería entre redibujos: la pestaña y la pieza que se está mirando. */
export interface ArmoryView {
  tab: 'loadout' | 'upgrades';
  selected: ArmoryItem | null;
}

const STATE_CLASS: Record<ItemState, string> = { equipped: 'equipped', owned: 'owned', buy: 'buy', poor: 'poor', locked: 'locked' };

function stateBadge(item: ArmoryItem, s: ItemState): string {
  const shop = itemShop(item);
  switch (s) {
    case 'equipped':
      return LOADOUT_TEXT.equipped;
    case 'owned':
      return LOADOUT_TEXT.owned;
    case 'buy':
      return `${shop?.price ?? 0} ◉`;
    case 'poor':
      return `${shop?.price ?? 0} ◉`;
    case 'locked':
      return LOADOUT_TEXT.locked;
  }
}

/** Lo que se puede hacer con una pieza: equiparla, comprarla o saber por qué no. */
function itemAction(api: LoadoutApi, item: ArmoryItem, onAfter: () => void): HTMLElement {
  const p = api.profile();
  const id = itemId(item);
  const s = itemState(p, item);
  const shop = itemShop(item);
  if (s === 'equipped') return h('span', { class: 'shop-status owned', text: LOADOUT_TEXT.equipped });
  if (s === 'owned') return button(LOADOUT_TEXT.equip, () => api.onEquip(item.slot, id), 'btn btn-primary');
  if (s === 'buy' && shop)
    return button(
      LOADOUT_TEXT.buy(shop.price),
      () => {
        api.onBuy(shop.id);
        // Lo recién comprado se equipa.
        api.onEquip(item.slot, id);
        onAfter();
      },
      'btn btn-primary',
    );
  if (s === 'poor' && shop) return h('span', { class: 'shop-status poor', text: LOADOUT_TEXT.poor(shop.price - p.coins) });
  return h('span', { class: 'shop-status locked', text: LOADOUT_TEXT.locked });
}

/** Nombre, descripción y barras de una pieza. */
function itemInfo(item: ArmoryItem): HTMLElement {
  const id = itemId(item);
  const stats = 'weapon' in item ? weaponStats(item.weapon) : gearStats(item.gear);
  return h('div', { class: 'armory-info', dataset: { info: id } }, [
    h('div', { class: 'armory-name', text: ITEM_NAMES[id] }),
    h('div', { class: 'armory-desc', text: ITEM_DESC[id] }),
    h(
      'div',
      { class: 'armory-stats' },
      stats.map((b) =>
        h('div', { class: 'sub' }, [
          h('span', { class: 'sub-label', text: b.label }),
          h('div', { class: 'sub-bar' }, [h('div', { class: 'sub-fill', style: { width: `${Math.round(b.value * 100)}%` } })]),
          h('span', { class: 'sub-value', text: b.text }),
        ]),
      ),
    ),
  ]);
}

/**
 * El panel de la pieza que se mira: vista previa, texto y la acción que toca. Los textos de todas están superpuestos y
 * solo se ve el de la elegida: el panel mide siempre lo que la más larga, así al pasar de una a otra nada se mueve ni
 * aparecen barras de desplazamiento.
 */
function detailPanel(api: LoadoutApi, preview: WeaponPreview | null, onAfter: () => void): { el: HTMLElement; select(item: ArmoryItem): void } {
  const infos = LOADOUT_SLOTS.flatMap(armoryItems).map(itemInfo);
  const action = h('div', { class: 'armory-action' });
  const el = h('div', { class: 'armory-detail', ariaLabel: 'Pieza seleccionada' }, [
    preview ? preview.canvas : h('div', { class: 'weapon-preview weapon-preview-off', text: LOADOUT_TEXT.previewUnavailable }),
    h('div', { class: 'armory-infos' }, infos),
    action,
  ]);
  let shown = '';
  const select = (item: ArmoryItem): void => {
    const id = itemId(item);
    if (id === shown) return;
    shown = id;
    if (preview) preview.show('weapon' in item ? WEAPON_MODEL[item.weapon] : item.gear, 0xd4af37);
    for (const i of infos) i.classList.toggle('on', i.dataset.info === id);
    action.replaceChildren(itemAction(api, item, onAfter));
  };
  return { el, select };
}

/**
 * La armería del Sommelier: pestaña de equipo (los cuatro huecos, sus piezas y el panel de la que se mira, con vista
 * previa en 3D) y pestaña de mejoras (el resto de la tienda).
 */
export function buildArmory(api: LoadoutApi, view: ArmoryView, preview: WeaponPreview | null, onClose: () => void, redraw: () => void): HTMLElement {
  const p = api.profile();
  const tabs = h('div', { class: 'armory-tabs', role: 'tablist' }, [
    tabButton(LOADOUT_TEXT.tabLoadout, view.tab === 'loadout', () => {
      view.tab = 'loadout';
      redraw();
    }),
    tabButton(LOADOUT_TEXT.tabUpgrades, view.tab === 'upgrades', () => {
      view.tab = 'upgrades';
      redraw();
    }),
  ]);
  const body = view.tab === 'loadout' ? loadoutTab(api, view, preview, redraw) : upgradesTab(api);
  return h('section', { class: 'screen screen-shop screen-armory', role: 'dialog', ariaLabel: 'Armería del Sommelier' }, [
    h('h2', { class: 'screen-heading', text: LOADOUT_TEXT.armory }),
    h('div', { class: 'coins', ariaLabel: 'Monedas' }, [
      h('span', { class: 'coin-icon', text: '◉' }),
      h('b', { class: 'coin-count', text: String(p.coins) }),
      ' Monedas Continental',
    ]),
    tabs,
    body,
    h('div', { class: 'menu' }, [button('Cerrar', onClose, 'btn')]),
  ]);
}

function tabButton(label: string, on: boolean, click: () => void): HTMLButtonElement {
  const b = button(label, click, on ? 'btn btn-small btn-primary' : 'btn btn-small');
  b.setAttribute('role', 'tab');
  b.setAttribute('aria-selected', String(on));
  b.dataset.focus = `tab:${label}`;
  return b;
}

function loadoutTab(api: LoadoutApi, view: ArmoryView, preview: WeaponPreview | null, redraw: () => void): HTMLElement {
  const p = api.profile();
  // Lo que se mira: lo elegido, o lo equipado en la principal.
  const selected = view.selected ?? { slot: 'primary', weapon: p.loadout.primary };
  const detail = detailPanel(api, preview, redraw);
  detail.select(selected);
  const select = (item: ArmoryItem): void => {
    view.selected = item;
    detail.select(item);
  };
  const slots = LOADOUT_SLOTS.map((slot) =>
    h('div', { class: 'armory-slot', dataset: { slot } }, [
      h('div', { class: 'armory-slot-head' }, [h('span', { text: LOADOUT_TEXT.slots[slot] }), keycap(api.label(LOADOUT_TEXT.slotKeys[slot]))]),
      h(
        'div',
        { class: 'armory-items' },
        armoryItems(slot).map((item) => {
          const s = itemState(p, item);
          const id = itemId(item);
          const b = h('button', { class: `armory-item ${STATE_CLASS[s]}`, type: 'button', dataset: { focus: `item:${id}`, item: id } }, [
            h('span', { class: 'armory-item-name', text: ITEM_NAMES[id] }),
            h('span', { class: 'armory-item-state', text: stateBadge(item, s) }),
          ]);
          b.addEventListener('click', (e) => {
            e.preventDefault();
            select(item);
          });
          b.addEventListener('focus', () => select(item));
          b.addEventListener('mouseenter', () => select(item));
          return b;
        }),
      ),
    ]),
  );
  return h('div', { class: 'armory-body' }, [
    h('div', { class: 'armory-slots' }, [h('p', { class: 'armory-hint', text: LOADOUT_TEXT.loadoutHint }), ...slots]),
    detail.el,
  ]);
}

function upgradesTab(api: LoadoutApi): HTMLElement {
  const p = api.profile();
  const rows = UPGRADE_ITEMS.map((item) => {
    const check = canBuy(p, item.id);
    const status =
      check === 'owned'
        ? h('span', { class: 'shop-status owned', text: 'Comprado' })
        : check === 'locked'
          ? h('span', { class: 'shop-status locked', text: `Requiere ${SHOP.find((s) => s.id === item.requires)?.name ?? '…'}` })
          : check === 'poor'
            ? h('span', { class: 'shop-status poor', text: `Faltan ${item.price - p.coins} monedas` })
            : button(`Comprar · ${item.price}`, () => api.onBuy(item.id), 'btn btn-small btn-primary');
    return h('div', { class: `shop-item ${check}`, dataset: { item: item.id } }, [
      h('div', { class: 'shop-text' }, [h('div', { class: 'shop-name', text: item.name }), h('div', { class: 'shop-desc', text: item.desc })]),
      h('div', { class: 'shop-price', text: check === 'owned' ? '✓' : `${item.price} ◉` }),
      status,
    ]);
  });
  return h('div', { class: 'shop-list' }, rows);
}

/**
 * El equipo en una fila: un selector por hueco con lo que el jugador tiene (anterior / siguiente). Va en el briefing de
 * cada contrato y en la sala del cooperativo.
 */
export function buildLoadoutBar(api: LoadoutApi): HTMLElement {
  const p = api.profile();
  const picks = LOADOUT_SLOTS.map((slot) => {
    const current = p.loadout[slot];
    const single = ownedCount(p, slot) <= 1;
    const step = (dir: 1 | -1): void => api.onEquip(slot, cycleOwned(p, slot, dir));
    const prev = button('‹', () => step(-1), 'btn btn-small loadout-step');
    const next = button('›', () => step(1), 'btn btn-small loadout-step');
    prev.disabled = single;
    next.disabled = single;
    prev.setAttribute('aria-label', `${LOADOUT_TEXT.slots[slot]}: anterior`);
    next.setAttribute('aria-label', `${LOADOUT_TEXT.slots[slot]}: siguiente`);
    prev.dataset.focus = `pick:${slot}:prev`;
    next.dataset.focus = `pick:${slot}:next`;
    return h('div', { class: 'loadout-pick', dataset: { slot } }, [
      h('span', { class: 'loadout-slot', text: LOADOUT_TEXT.slots[slot] }),
      prev,
      h('span', { class: 'loadout-item', text: current ? ITEM_NAMES[current] : LOADOUT_TEXT.none }),
      next,
    ]);
  });
  return h('div', { class: 'loadout-bar', ariaLabel: LOADOUT_TEXT.loadoutTitle }, [
    h('div', { class: 'achv-title', text: LOADOUT_TEXT.loadoutTitle }),
    ...picks,
  ]);
}
