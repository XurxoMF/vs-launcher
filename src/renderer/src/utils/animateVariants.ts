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

export const GRIDGROUP_VARIANTS: Variants = {
  animate: {
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.05
    }
  }
}

export const GRIDITEM_VARIANTS: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
}

export const LISTGROUP_VARIANTS: Variants = {
  animate: {
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.1
    }
  }
}

export const LISTITEM_VARIANTS: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
}

export const TABLEBODY_VARIANTS: Variants = {
  animate: {
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.05
    }
  }
}

export const TABLEROW_VARIANTS: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
}

export const POPUP_WRAPPER_VARIANTS: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
}

export const POPUP_VARIANTS: Variants = {
  initial: { scale: 0.8 },
  animate: { scale: 1 },
  exit: { scale: 0.8 }
}
