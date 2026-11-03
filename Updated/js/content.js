// =============================================================
// WEBSITE CONTENT FROM THE WEBSITE ADMIN APP
// "Publish Website" in the Tri-Stone Website Admin app writes
// /Updated/content/site.json (and its pictures in /Updated/content/images).
// This file reads it and fills the page: hero, services, projects,
// About Us and the contact details.
// If site.json is missing or can't be read, the page keeps the text
// and pictures typed in index.html. Empty pictures keep the page's own.
// Load it AFTER gallery.js (it refills the projects gallery).
// =============================================================
(function () {
  "use strict";

  // Each service card picks one of these looks in Website Admin ("icon"):
  // its icon, and the picture shown when the card has no picture of its own.
  const SERVICE_LOOK = {
    ruler: { icon: "/Updated/images/icon-ruler.svg", image: "/Updated/images/Residential.jpg" },
    helmet: { icon: "/Updated/images/icon-helmet.svg", image: "/Updated/images/commercial.jpg" },
    tools: { icon: "/Updated/images/icon-tools.svg", image: "/Updated/images/repairs.jpg" }
  };
  // Content published before icons existed: the 3 original services
  const LOOK_BY_NAME = {
    "Residential Construction": "ruler",
    "Commercial Construction": "helmet",
    "Repairs and Home Extension": "tools"
  };
  const ABOUT_IMAGE = "/Updated/images/image 40.jpg";

  fetch("/Updated/content/site.json", { cache: "no-cache" })
    .then((r) => (r.ok ? r.json() : null))
    .then((site) => { if (site) fill(site); })
    .catch(() => { /* keep the page as typed */ });

  function fill(site) {
    run(fillHome, site.home);
    run(fillContact, site.contact);
    run(fillServices, site.services);
    run(fillProjects, site.projects);
    run(fillAbout, site.about);
  }

  // One part failing never stops the others
  function run(part, data) {
    if (data == null) return;
    try { part(data); } catch (e) { console.warn("content.js:", e); }
  }

  function el(tag, className, text) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (text != null) e.textContent = text;
    return e;
  }

  function setText(selector, text) {
    if (text == null) return;
    document.querySelectorAll(selector).forEach((e) => { e.textContent = text; });
  }

  // ---- Home (hero) ----
  function fillHome(home) {
    setText(".hero-content .mid", home.headline);
    setText(".hero-content .bot", home.subheadline || "");
    if (home.image) document.getElementById("intro-image").src = home.image;
  }

  // ---- Contact details + footer ----
  function fillContact(c) {
    if (c.phone) {
      setText(".company-details .phone", c.phone);
      setText(".hero-content .phone", "Call us " + c.phone);
    }
    setText(".company-details .address", c.address);
    setText(".footer-left p", c.address);
    setText(".footer-right p", c.copyright);
    if (c.email) {
      // The first line is the email; keep the lines after it (Facebook)
      const socials = document.querySelector(".company-details .socials");
      const first = socials && [...socials.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim());
      if (first) first.textContent = "\n              " + c.email;
    }
  }

  // ---- Services cards ----
  function fillServices(services) {
    const track = document.getElementById("cards-track");
    if (!track) return;
    track.innerHTML = "";
    services.forEach((s, i) => {
      // Newer content says where its icon is (icon_url) and already puts the right website picture in image
      const look = s.icon_url ? { icon: s.icon_url, image: "" }
        : SERVICE_LOOK[s.icon] || SERVICE_LOOK[LOOK_BY_NAME[s.name]] || SERVICE_LOOK.ruler;
      const card = el("div", i % 2 === 1 ? "card card-bordered" : "card");

      const top = el("div", "card-top");
      top.appendChild(el("span", "card-number", String(i + 1).padStart(2, "0") + "."));
      if (look.icon) {
        const icon = el("img", "card-icon");
        icon.src = look.icon;
        icon.alt = "";
        top.appendChild(icon);
      }
      card.appendChild(top);
      card.appendChild(el("h3", "card-title", s.name));
      card.appendChild(el("p", "card-desc", s.description || ""));

      const wrap = el("div", "card-img-wrapper");
      const img = el("img");
      img.src = s.image || look.image || "";
      img.alt = s.name;
      wrap.appendChild(img);
      card.appendChild(wrap);

      const btn = el("a", "card-btn", "INQUIRE NOW");
      btn.href = "#contact";
      card.appendChild(btn);
      track.appendChild(card);
    });
  }

  // ---- Projects gallery (uses gallery.js) ----
  function fillProjects(projects) {
    const shown = projects.filter((p) => p.photos && p.photos.length > 0);
    const section = document.getElementById("projects");
    if (shown.length === 0) {
      if (section) section.hidden = true;   // nothing to show
      return;
    }
    if (typeof galleryData === "undefined") return;
    Object.keys(galleryData).forEach((k) => delete galleryData[k]);
    shown.forEach((p, i) => {
      const where = p.location ? " — " + p.location : "";
      galleryData["project" + i] = {
        label: p.title + where,
        subtitle: "Featured Projects: " + p.title + (p.location ? ", " + p.location : ""),
        images: p.photos.map((url) => ({ url: url, caption: p.description || p.title }))
      };
    });
    currentCategory = "project0";
    buildDropdown();
    loadCategory(currentCategory);
  }

  // ---- About Us rows (picture and text take turns) ----
  function fillAbout(sections) {
    const grid = document.querySelector(".aboutus-grid");
    if (!grid || sections.length === 0) return;
    grid.innerHTML = "";
    sections.forEach((s, i) => {
      const textFirst = i % 2 === 1;
      const row = el("div", textFirst ? "aboutus-split-row aboutus-reverse-mobile" : "aboutus-split-row");

      const imgCol = el("div", "aboutus-col aboutus-img-col");
      const img = el("img");
      img.src = s.image || ABOUT_IMAGE;
      img.alt = s.heading;
      imgCol.appendChild(img);

      const textCol = el("div", "aboutus-col aboutus-text-col " + (textFirst ? "aboutus-light-bg" : "aboutus-dark-bg"));
      const content = el("div", "aboutus-text-content");
      addPart(content, s.heading, s.text, !!s.second_heading);
      if (s.second_heading) addPart(content, s.second_heading, s.second_text, false);
      textCol.appendChild(content);

      if (textFirst) { row.appendChild(textCol); row.appendChild(imgCol); }
      else { row.appendChild(imgCol); row.appendChild(textCol); }
      grid.appendChild(row);
    });
  }

  function addPart(content, heading, text, spaceAfter) {
    const label = el("div", "aboutus-section-label");
    label.appendChild(el("div", "aboutus-accent-line"));
    label.appendChild(el("span", null, (heading || "").toUpperCase()));
    content.appendChild(label);
    // Each typed paragraph (blank line between) becomes its own <p>
    const paragraphs = (text || "").split(/\n\s*\n/).map((t) => t.trim()).filter(Boolean);
    paragraphs.forEach((t, i) => {
      const p = el("p", spaceAfter && i === paragraphs.length - 1 ? "aboutus-mb-20" : null, t);
      content.appendChild(p);
    });
  }
})();
