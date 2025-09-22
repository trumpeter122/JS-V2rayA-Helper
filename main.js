// ==UserScript==
// @name         V2rayA Helper
// @description  Helper utilities for V2rayA web GUI
// @author       Trumpeter
// @match        http://localhost:2017/
// ==/UserScript==

;(async () => {
  const clickElement = async (element) => {
    const oldBg = element.style.backgroundColor
    element.style.backgroundColor = "#ff0"
    element.style.transition = "background .3s"
    setTimeout(() => {
      element.style.backgroundColor = oldBg || ""
    }, 300)

    element.click()
  }

  const waitForStatus = (statusTag, is_success) => {
    return new Promise((resolve) => {
      const observer = new MutationObserver(() => {
        if (
          (statusTag.classList.contains("is-success") && is_success) ||
          (statusTag.classList.contains("is-danger") && !is_success)
        ) {
          observer.disconnect()
          resolve()
        }
      })

      observer.observe(statusTag, {
        attributes: true,
        attributeFilter: ["class"],
      })
    })
  }

  const waitForSuccessToast = () => {
    return new Promise((resolve) => {
      const observer = new MutationObserver(() => {
        const toast = [
          ...document.querySelectorAll(".toast.is-primary.is-top"),
        ].find((el) => el.textContent.trim().toLowerCase().includes("success"))

        if (toast) {
          observer.disconnect()
          resolve()
        }
      })

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      })
    })
  }

  const waitForCancelSelectButton = (cancelSelectButton, cancel) => {
    return new Promise((resolve) => {
      const textSpan = cancelSelectButton.querySelector("span:nth-of-type(2)")

      const observer = new MutationObserver(() => {
        const cancleSelect = textSpan.textContent.trim()

        if (
          (cancleSelect === "Cancel" && cancel === true) ||
          (cancleSelect === "Select" && cancel === false)
        ) {
          observer.disconnect()
          resolve()
        }
      })

      observer.observe(cancelSelectButton, {
        characterData: true,
        subtree: true,
      })
    })
  }

  const completelyUpdate = async () => {
    const statusTag = document.getElementById("statusTag")

    const subscriptionTab = document.evaluate(
      "//a[span[normalize-space()='SUBSCRIPTION']]",
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null,
    ).singleNodeValue

    const serverTab = document.evaluate(
      "//a[span[normalize-space()='JMSSUB.NET']]",
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null,
    ).singleNodeValue

    const updateButton = document.evaluate(
      `//button[normalize-space(span[2])='Update']`,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null,
    ).singleNodeValue

    const getCancleButtons = () =>
      [
        ...document.querySelectorAll("button.button.is-small.is-warning"),
      ].filter((btn) => btn.textContent.trim() === "Cancel")
    const getSelectButtons = () =>
      [
        ...document.querySelectorAll("button.button.is-small.is-warning"),
      ].filter((btn) => btn.textContent.trim() === "Select")

    try {
      clickElement(serverTab)
      await new Promise((r) => setTimeout(r, 500))
      clickElement(statusTag)
      await waitForStatus(statusTag, false)
      await new Promise((r) => setTimeout(r, 500))
      for (const button of getCancleButtons()) {
        clickElement(button)
        await waitForCancelSelectButton(button, false)
      }
      await new Promise((r) => setTimeout(r, 500))
      clickElement(subscriptionTab)
      await new Promise((r) => setTimeout(r, 500))
      clickElement(updateButton)
      await waitForSuccessToast()
      await new Promise((r) => setTimeout(r, 500))
      clickElement(serverTab)
      await new Promise((r) => setTimeout(r, 500))
      for (const button of getSelectButtons()) {
        clickElement(button)
        await waitForCancelSelectButton(button, true)
      }
      clickElement(statusTag)
    } catch (e) {
      console.error(e)
    }
  }

  // UI

  // Create floating button
  const button = document.createElement("button")
  button.textContent = "Helper"
  button.style.position = "fixed"
  button.style.bottom = "20px"
  button.style.right = "20px"
  button.style.zIndex = "1000"
  button.style.borderRadius = "5px"
  document.body.appendChild(button)

  // Create overlay
  const overlay = document.createElement("div")
  overlay.style.position = "fixed"
  overlay.style.top = "0"
  overlay.style.left = "0"
  overlay.style.width = "100%"
  overlay.style.height = "100%"
  overlay.style.background = "rgba(0,0,0,0.5)"
  overlay.style.zIndex = "1000"
  overlay.style.display = "none"
  document.body.appendChild(overlay)

  // Create modal
  const modal = document.createElement("div")
  modal.style.position = "fixed"
  modal.style.top = "50%"
  modal.style.left = "50%"
  modal.style.transform = "translate(-50%, -50%)"
  modal.style.background = "white"
  modal.style.padding = "20px"
  modal.style.border = "1px solid black"
  modal.style.zIndex = "1001"
  modal.style.display = "none"
  modal.style.maxWidth = "600px"
  modal.style.width = "90%"
  modal.style.maxHeight = "80%"
  modal.style.borderRadius = "10px"
  modal.style.overflowY = "auto"
  modal.innerHTML = `
        <h2 style="margin-bottom: 10px;">Helper operations</h2>
        <button id="complete-update">Update Completely</button>
        <button id="cancel-modal">Cancel</button>
    `
  document.body.appendChild(modal)

  // Show modal
  function showModal() {
    modal.style.display = "block"
    overlay.style.display = "block"
  }

  // Cancel modal
  function cancelModal() {
    modal.style.display = "none"
    overlay.style.display = "none"
  }

  // Event listeners
  button.addEventListener("click", showModal)

  overlay.addEventListener("click", cancelModal)

  document.getElementById("cancel-modal").addEventListener("click", cancelModal)

  document.getElementById("complete-update").addEventListener("click", () => {
    cancelModal()
    completelyUpdate()
  })
})()
