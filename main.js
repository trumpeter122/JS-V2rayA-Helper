// ==UserScript==
// @name         V2rayA Helper
// @description  Helper utilities for V2rayA web GUI
// @author       Trumpeter
// @match        http://localhost:2017/
// ==/UserScript==

(async () => {
	//
	// Subscription nodes status Helper
	//
	const mapNodes = () => {
		const statusColorMappings = {
			"is-success": "rgb(80,109,164,.3)",
			"is-primary": "rgb(255, 224, 138,.3)",
			"is-danger": "rgba(255,69,58,.3)",
		};

		const nodesSidebar = document.querySelectorAll(
			"div.sidebar-content > article",
		);

		const subStati = [...nodesSidebar].reduce((acc, article) => {
			const subLink = article
				.querySelector("p")
				?.innerText?.match(/(.*\.com).*/)?.[1];
			const status = Object.keys(statusColorMappings).find((flag) =>
				article.classList.contains(flag),
			);
			if (subLink && status) acc[subLink] = status;
			return acc;
		}, {});

		const nodesTable = document.querySelectorAll("tr.is-connected-running");

		Object.entries(subStati).forEach(([subLink, status]) => {
			[...nodesTable]
				.filter((row) => row.innerText.includes(subLink))
				.forEach((row) => {
					row.style.backgroundColor = statusColorMappings[status];
				});
		});
	};

	const waitForSubscriptionLists = () => {
		return new Promise((resolve) => {
			const observer = new MutationObserver(() => {
				const sideBar = document.querySelector(
					"div.b-sidebar.node-status-sidebar",
				);
				const table = document.querySelector(
					"div.table-wrapper.has-mobile-cards",
				);

				if (sideBar && table) {
					observer.disconnect();
					resolve([sideBar, table]);
				}
			});

			observer.observe(document.body, {
				childList: true,
				subtree: true,
			});
		});
	};
	const [sideBar, table] = await waitForSubscriptionLists();

	[sideBar, table].forEach((node) => {
		new MutationObserver(mapNodes).observe(node, {
			childList: true,
			subtree: true,
			attributes: true,
			characterData: true,
		});
	});

	//
	// Update helper
	//
	const clickElement = async (element) => {
		const oldBg = element.style.backgroundColor;
		element.style.backgroundColor = "rgba(255,69,58,.3)";
		element.style.transition = "background .3s";
		setTimeout(() => {
			element.style.backgroundColor = oldBg || "";
		}, 300);

		element.click();
	};

	const waitForStatus = (statusTag, is_success) => {
		return new Promise((resolve) => {
			const observer = new MutationObserver(() => {
				if (
					(statusTag.classList.contains("is-success") && is_success) ||
					(statusTag.classList.contains("is-danger") && !is_success)
				) {
					observer.disconnect();
					resolve();
				}
			});

			observer.observe(statusTag, {
				attributes: true,
				attributeFilter: ["class"],
			});
		});
	};

	const waitForSuccessToast = () => {
		return new Promise((resolve) => {
			const observer = new MutationObserver(() => {
				const toast = [
					...document.querySelectorAll(".toast.is-primary.is-top"),
				].find((el) => el.textContent.trim().toLowerCase().includes("success"));

				if (toast) {
					observer.disconnect();
					resolve();
				}
			});

			observer.observe(document.body, {
				childList: true,
				subtree: true,
			});
		});
	};

	const waitForCancelSelectButton = (cancelSelectButton, cancel) => {
		return new Promise((resolve) => {
			const textSpan = cancelSelectButton.querySelector("span:nth-of-type(2)");

			const observer = new MutationObserver(() => {
				const cancleSelect = textSpan.textContent.trim();

				if (
					(cancleSelect === "Cancel" && cancel === true) ||
					(cancleSelect === "Select" && cancel === false)
				) {
					observer.disconnect();
					resolve();
				}
			});

			observer.observe(cancelSelectButton, {
				characterData: true,
				subtree: true,
			});
		});
	};

	const completelyUpdate = async () => {
		const statusTag = document.getElementById("statusTag");

		const subscriptionTab = document.evaluate(
			"//a[span[normalize-space()='SUBSCRIPTION']]",
			document,
			null,
			XPathResult.FIRST_ORDERED_NODE_TYPE,
			null,
		).singleNodeValue;

		const serverTab = document.evaluate(
			"//a[span[normalize-space()='JMSSUB.NET']]",
			document,
			null,
			XPathResult.FIRST_ORDERED_NODE_TYPE,
			null,
		).singleNodeValue;

		const updateButton = document.evaluate(
			`//button[normalize-space(span[2])='Update']`,
			document,
			null,
			XPathResult.FIRST_ORDERED_NODE_TYPE,
			null,
		).singleNodeValue;

		const getCancleButtons = () =>
			[
				...document.querySelectorAll("button.button.is-small.is-warning"),
			].filter((btn) => btn.textContent.trim() === "Cancel");
		const getSelectButtons = () =>
			[
				...document.querySelectorAll("button.button.is-small.is-warning"),
			].filter((btn) => btn.textContent.trim() === "Select");

		try {
			clickElement(serverTab);
			await new Promise((r) => setTimeout(r, 500));
			clickElement(statusTag);
			await waitForStatus(statusTag, false);
			await new Promise((r) => setTimeout(r, 500));
			for (const button of getCancleButtons()) {
				clickElement(button);
				await waitForCancelSelectButton(button, false);
			}
			await new Promise((r) => setTimeout(r, 500));
			clickElement(subscriptionTab);
			await new Promise((r) => setTimeout(r, 500));
			clickElement(updateButton);
			await waitForSuccessToast();
			await new Promise((r) => setTimeout(r, 500));
			clickElement(serverTab);
			await new Promise((r) => setTimeout(r, 500));
			for (const button of getSelectButtons()) {
				clickElement(button);
				await waitForCancelSelectButton(button, true);
			}
			clickElement(statusTag);
		} catch (e) {
			console.error(e);
		}
	};

	//
	// UI
	//
	// Create floating button
	const button = document.createElement("button");
	button.textContent = "Update All";
	button.style.position = "fixed";
	button.style.bottom = "20px";
	button.style.right = "20px";
	button.style.zIndex = "1000";
	button.style.borderRadius = "5px";
	document.body.appendChild(button);

	button.addEventListener("click", () => {
		completelyUpdate();
	});
})();
