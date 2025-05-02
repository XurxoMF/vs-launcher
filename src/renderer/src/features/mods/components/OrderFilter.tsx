import { AnimatePresence, motion } from "motion/react"
import { Dispatch, SetStateAction, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { PiArrowDownDuotone, PiArrowsDownUpDuotone, PiCalendarDuotone, PiChatCenteredTextDuotone, PiDownloadDuotone, PiFireDuotone, PiStarDuotone, PiUploadDuotone } from "react-icons/pi"
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react"

import { NormalButton } from "@renderer/components/ui/Buttons"

import { DROPDOWN_MENU_ITEM_VARIANTS, DROPDOWN_MENU_WRAPPER_VARIANTS } from "@renderer/utils/animateVariants"

function OrderFilter({
  orderBy,
  setOrderBy,
  orderByOrder,
  setOrderByOrder
}: {
  orderBy: string
  setOrderBy: Dispatch<SetStateAction<string>>
  orderByOrder: string
  setOrderByOrder: Dispatch<SetStateAction<string>>
}): JSX.Element {
  const { t } = useTranslation()

  const ORDER_BY = [
    { key: "trendingpoints", value: t("generic.trending"), icon: <PiFireDuotone /> },
    { key: "downloads", value: t("generic.downloads"), icon: <PiDownloadDuotone /> },
    { key: "comments", value: t("generic.comments"), icon: <PiChatCenteredTextDuotone /> },
    { key: "lastreleased", value: t("generic.updated"), icon: <PiUploadDuotone /> },
    { key: "asset.created", value: t("generic.created"), icon: <PiCalendarDuotone /> },
    { key: "follows", value: t("generic.follows"), icon: <PiStarDuotone /> }
  ]

  useEffect(() => {
    const lsOrderBy = window.localStorage.getItem("listModsOrderBy")
    if (lsOrderBy !== null && ORDER_BY.some((ob) => ob.key === lsOrderBy)) setOrderBy(lsOrderBy)

    const lsOrderByOrder = window.localStorage.getItem("listModsOrderByOrder")
    if (lsOrderByOrder !== null && (lsOrderByOrder === "desc" || lsOrderByOrder === "asc")) setOrderByOrder(lsOrderByOrder)
  }, [])

  function changeOrder(order: string): void {
    if (orderBy === order) {
      const newOrder = orderByOrder === "desc" ? "asc" : "desc"
      window.localStorage.setItem("listModsOrderByOrder", newOrder)
      setOrderByOrder(newOrder)
    } else {
      window.localStorage.setItem("listModsOrderBy", order)
      setOrderBy(order)
      window.localStorage.setItem("listModsOrderByOrder", "desc")
      setOrderByOrder("desc")
    }
  }

  return (
    <Menu>
      {({ open }) => (
        <>
          <MenuButton
            title={t("generic.order")}
            className="w-8 h-8 flex items-center justify-center gap-2 rounded-sm overflow-hidden border border-zinc-400/5 bg-zinc-950/50 shadow-sm shadow-zinc-950/50 hover:shadow-none cursor-pointer text-lg"
          >
            <PiArrowsDownUpDuotone />
          </MenuButton>
          <AnimatePresence>
            {open && (
              <MenuItems static anchor="bottom" className="w-40 z-600 mt-1 select-none rounded-sm overflow-hidden">
                <motion.ul
                  variants={DROPDOWN_MENU_WRAPPER_VARIANTS}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="w-full flex flex-col bg-zinc-950/50 backdrop-blur-md border border-zinc-400/5 shadow-sm shadow-zinc-950/50 hover:shadow-none rounded-sm"
                >
                  {ORDER_BY.map((ob) => (
                    <MenuItem
                      key={ob.key}
                      as={motion.li}
                      variants={DROPDOWN_MENU_ITEM_VARIANTS}
                      className="shrink-0 w-full h-8 flex items-center overflow-hidden odd:bg-zinc-800/30 even:bg-zinc-950/30 cursor-pointer whitespace-nowrap text-ellipsis text-sm px-2 py-1"
                    >
                      <NormalButton title={`${ob.value}`} onClick={() => changeOrder(ob.key)} className="w-full">
                        <div className="w-full flex items-center justify-between gap-1">
                          <p className="flex items-center gap-1">
                            <span>{ob.icon}</span>
                            <span>{ob.value}</span>
                          </p>
                          <p className="flex items-center gap-1">{orderBy === ob.key && (orderByOrder === "desc" ? <PiArrowDownDuotone /> : <PiArrowDownDuotone className="rotate-180" />)}</p>
                        </div>
                      </NormalButton>
                    </MenuItem>
                  ))}
                </motion.ul>
              </MenuItems>
            )}
          </AnimatePresence>
        </>
      )}
    </Menu>
  )
}

export default OrderFilter
