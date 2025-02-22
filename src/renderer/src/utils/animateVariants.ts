import { Variants } from "motion/react"

export const DROPDOWN_MENU_WRAPPER_VARIANTS: Variants = {
  initial: {
    opacity: 0
  },
  animate: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.1
    }
  },
  exit: {
    opacity: 0
  }
}

export const DROPDOWN_MENU_ITEM_VARIANTS: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
}

export const DROPUP_MENU_WRAPPER_VARIANTS: Variants = {
  initial: {
    opacity: 0
  },
  animate: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.1,
      staggerDirection: -1
    }
  },
  exit: {
    opacity: 0
  }
}

export const DROPUP_MENU_ITEM_VARIANTS: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
}
