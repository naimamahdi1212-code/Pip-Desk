(function () {
  "use strict";

  var databases = window.pipDeskDatabases;
  var form = document.getElementById("lessonForm");
  var listEl = document.getElementById("lessonList");
  var alertBox = document.getElementById("adminAlert");
  var cancelBtn = document.getElementById("cancelEditButton");
  var saveBtn = document.getElementById("saveButton");
  var seedBtn = document.getElementById("seedButton");

  if (!databases || !form) return;

  var titleInput = document.getElementById("title");
  var slugInput = document.getElementById("slug");
  var summaryInput = document.getElementById("summary");
  var imageInput = document.getElementById("image");
  var orderInput = document.getElementById("order");
  var publishedInput = document.getElementById("published");
  var bodyInput = document.getElementById("body");
  var documentIdInput = document.getElementById("documentId");

  var slugTouchedManually = false;

  function slugify(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  titleInput.addEventListener("input", function () {
    if (!slugTouchedManually) {
      slugInput.value = slugify(titleInput.value);
    }
  });
  slugInput.addEventListener("input", function () {
    slugTouchedManually = true;
  });

  function showAlert(message, type) {
    alertBox.textContent = message;
    alertBox.hidden = false;
    alertBox.classList.remove("is-error", "is-success");
    alertBox.classList.add(type === "success" ? "is-success" : "is-error");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    form.reset();
    documentIdInput.value = "";
    slugTouchedManually = false;
    cancelBtn.hidden = true;
    saveBtn.textContent = "Save lesson";
  }

  cancelBtn.addEventListener("click", resetForm);

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var data = {
      title: titleInput.value.trim(),
      slug: slugInput.value.trim(),
      summary: summaryInput.value.trim(),
      image: imageInput.value.trim(),
      order: parseInt(orderInput.value, 10) || 1,
      published: publishedInput.checked,
      body: bodyInput.value
    };

    var existingId = documentIdInput.value;
    saveBtn.disabled = true;

    var request = existingId
      ? databases.updateDocument({
          databaseId: window.PIPDESK_DATABASE_ID,
          collectionId: window.PIPDESK_LESSONS_COLLECTION_ID,
          documentId: existingId,
          data: data
        })
      : databases.createDocument({
          databaseId: window.PIPDESK_DATABASE_ID,
          collectionId: window.PIPDESK_LESSONS_COLLECTION_ID,
          documentId: Appwrite.ID.unique(),
          data: data,
          permissions: [
            Appwrite.Permission.read(Appwrite.Role.users()),
            Appwrite.Permission.update(Appwrite.Role.team(window.PIPDESK_ADMIN_TEAM_ID)),
            Appwrite.Permission.delete(Appwrite.Role.team(window.PIPDESK_ADMIN_TEAM_ID))
          ]
        });

    request
      .then(function () {
        showAlert(existingId ? "Lesson updated." : "Lesson created.", "success");
        resetForm();
        loadLessons();
      })
      .catch(function (error) {
        showAlert(error.message || "Couldn't save this lesson.", "error");
      })
      .then(function () {
        saveBtn.disabled = false;
      });
  });

  function editLesson(lesson) {
    documentIdInput.value = lesson.$id;
    titleInput.value = lesson.title || "";
    slugInput.value = lesson.slug || "";
    summaryInput.value = lesson.summary || "";
    imageInput.value = lesson.image || "";
    orderInput.value = lesson.order || 1;
    publishedInput.checked = !!lesson.published;
    bodyInput.value = lesson.body || "";
    slugTouchedManually = true;
    cancelBtn.hidden = false;
    saveBtn.textContent = "Update lesson";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function deleteLesson(lesson) {
    if (!window.confirm('Delete "' + lesson.title + '"? This can\'t be undone.')) {
      return;
    }
    databases
      .deleteDocument({
        databaseId: window.PIPDESK_DATABASE_ID,
        collectionId: window.PIPDESK_LESSONS_COLLECTION_ID,
        documentId: lesson.$id
      })
      .then(function () {
        loadLessons();
      })
      .catch(function (error) {
        showAlert(error.message || "Couldn't delete this lesson.", "error");
      });
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
  }

  function renderList(lessons) {
    if (lessons.length === 0) {
      listEl.innerHTML = '<p class="lesson-loading mono">No lessons yet.</p>';
      return;
    }
    listEl.innerHTML = lessons
      .map(function (lesson, index) {
        return (
          '<div class="admin-list-row" data-index="' + index + '">' +
            '<div class="admin-list-info">' +
              '<p class="admin-list-order mono">#' + (lesson.order || "?") + "</p>" +
              "<p class=\"admin-list-title\">" + escapeHtml(lesson.title) +
                (lesson.published ? "" : ' <span class="admin-draft-tag">DRAFT</span>') +
              "</p>" +
              '<p class="admin-list-slug mono">' + escapeHtml(lesson.slug) + "</p>" +
            "</div>" +
            '<div class="admin-list-actions">' +
              '<button type="button" class="logout-link" data-action="edit">Edit</button>' +
              '<button type="button" class="logout-link" data-action="delete">Delete</button>' +
            "</div>" +
          "</div>"
        );
      })
      .join("");

    listEl.querySelectorAll(".admin-list-row").forEach(function (row) {
      var index = parseInt(row.getAttribute("data-index"), 10);
      var lesson = lessons[index];
      row.querySelector('[data-action="edit"]').addEventListener("click", function () {
        editLesson(lesson);
      });
      row.querySelector('[data-action="delete"]').addEventListener("click", function () {
        deleteLesson(lesson);
      });
    });
  }

  function loadLessons() {
    listEl.innerHTML = '<p class="lesson-loading mono">Loading…</p>';
    databases
      .listDocuments({
        databaseId: window.PIPDESK_DATABASE_ID,
        collectionId: window.PIPDESK_LESSONS_COLLECTION_ID,
        queries: [Appwrite.Query.orderAsc("order"), Appwrite.Query.limit(100)]
      })
      .then(function (result) {
        renderList(result.documents || []);
      })
      .catch(function (error) {
        listEl.innerHTML =
          '<p class="lesson-loading mono">Couldn\u2019t load lessons.</p>';
        console.error(error);
      });
  }

  // ================================================================
  // Seed the original 8 starter lessons — safe to click more than
  // once, but will create duplicates if you do, so use it once.
  // ================================================================
  var STARTER_LESSONS = [
    {
      title: "What Is Forex Trading?",
      slug: "what-is-forex-trading",
      summary: "What actually gets bought and sold, who trades currencies, and why prices move at all.",
      image: "lesson-01.jpg",
      order: 1,
      body:
        "Forex trading means exchanging one currency for another, betting that " +
        "the one you're buying will gain value against the one you're selling.\n\n" +
        "## Who actually trades currencies?\n\n" +
        "Banks, governments, big companies moving money across borders, and " +
        "individual traders all take part. It's the largest financial market " +
        "in the world, and it never fully closes on weekdays.\n\n" +
        "## Why do prices move?\n\n" +
        "Currency prices shift based on things like interest rates, economic " +
        "data, political events, and simply how much of a currency people " +
        "want to hold at any given moment. None of it is random — but it can " +
        "look that way until you understand what's driving it."
    },
    {
      title: "Pips, Lots, and Prices",
      slug: "pips-lots-prices",
      summary: "How price moves are measured and how position size changes what a single pip is worth.",
      image: "lesson-02.jpg",
      order: 2,
      body:
        "A **pip** is the smallest standard price move for a currency pair — " +
        "usually the fourth decimal place, like the last digit in 1.0842.\n\n" +
        "## Why pips matter\n\n" +
        "Instead of saying \"the price moved by 0.0001,\" traders just say " +
        "\"one pip.\" It's a shared unit that makes it easy to talk about small " +
        "moves without arguing over decimal places.\n\n" +
        "## Lot size changes what a pip is worth\n\n" +
        "A pip isn't worth a fixed dollar amount — it depends on how big your " +
        "position is. A bigger position (a bigger \"lot\") means each pip move " +
        "is worth more money, in either direction."
    },
    {
      title: "Leverage and Margin",
      slug: "leverage-and-margin",
      summary: "How borrowed buying power works, and why it magnifies both gains and losses.",
      image: "lesson-03.jpg",
      order: 3,
      body:
        "**Leverage** lets you control a larger position than your account " +
        "balance would normally allow, by borrowing the difference from your " +
        "broker.\n\n" +
        "## A quick example\n\n" +
        "With 10:1 leverage, $500 of your own money can control a $5,000 " +
        "position. That sounds appealing — but it cuts both ways.\n\n" +
        "## Why it's risky\n\n" +
        "- A 2% move against you is a 20% hit to your actual money\n" +
        "- Losses can eat through your account balance much faster than the " +
        "underlying price move suggests\n" +
        "- **Margin** is the portion of your balance set aside as collateral " +
        "for a leveraged position — if losses eat into it too far, your " +
        "broker can close the trade for you automatically"
    },
    {
      title: "Reading a Currency Quote",
      slug: "reading-a-currency-quote",
      summary: "Making sense of pairs like EUR/USD, and the difference between the bid and the ask.",
      image: "lesson-04.jpg",
      order: 4,
      body:
        "Currencies are always quoted in pairs, like EUR/USD, because you're " +
        "always trading one currency *against* another.\n\n" +
        "## Base and quote currency\n\n" +
        "In EUR/USD, the euro is the **base currency** and the US dollar is " +
        "the **quote currency**. The price tells you how many dollars it " +
        "takes to buy one euro.\n\n" +
        "## Bid vs. ask\n\n" +
        "Every quote actually has two prices:\n\n" +
        "- The **bid** — the price you can sell at\n" +
        "- The **ask** — the price you can buy at\n\n" +
        "The ask is always a little higher than the bid. That gap is the " +
        "**spread**, and it's effectively the cost of placing the trade."
    },
    {
      title: "Candlestick Charts",
      slug: "candlestick-charts",
      summary: "How to read open, high, low, and close at a glance, and spot a trend forming.",
      image: "lesson-05.jpg",
      order: 5,
      body:
        "A candlestick packs four numbers into one shape: the **open**, " +
        "**close**, **high**, and **low** price for a single time period.\n\n" +
        "## The body and the wicks\n\n" +
        "The thick part (the **body**) spans from the open to the close. The " +
        "thin lines above and below (the **wicks**) mark the highest and " +
        "lowest points the price touched.\n\n" +
        "## Colour tells you the direction\n\n" +
        "A mint-green candle closed higher than it opened — price rose over " +
        "that period. A coral candle closed lower than it opened — price " +
        "fell. Once you can read a single candle, reading a whole chart is " +
        "just reading many of them in a row."
    },
    {
      title: "A Simple Risk Management Plan",
      slug: "risk-management-plan",
      summary: "Setting a rule for how much you'll risk per trade, before you ever place one.",
      image: "lesson-06.jpg",
      order: 6,
      body:
        "The traders who last aren't the ones who never lose — they're the " +
        "ones who never let a single loss wipe them out.\n\n" +
        "## Decide your risk before you trade\n\n" +
        "A common starting rule: never risk more than 1–2% of your account " +
        "on a single trade. That way, a losing streak shrinks your account " +
        "gradually instead of catastrophically.\n\n" +
        "## Write it down\n\n" +
        "A rule you only keep in your head is easy to break in the moment. " +
        "Write your risk rule down before you fund a real account, and treat " +
        "it as non-negotiable — especially early on, while you're still " +
        "learning how you react under pressure."
    },
    {
      title: "Trading Sessions and Market Hours",
      slug: "trading-sessions-market-hours",
      summary: "Why forex trades around the clock, and how the Asian, London, and New York sessions overlap and differ.",
      image: "lesson-07.jpg",
      order: 7,
      body:
        "Forex doesn't have one central exchange with fixed hours — it trades " +
        "across financial centers worldwide, so the market is open nearly " +
        "24 hours a day on weekdays.\n\n" +
        "## The three main sessions\n\n" +
        "- **Asian session** — generally quieter, dominated by yen and " +
        "Australian dollar activity\n" +
        "- **London session** — one of the busiest, with heavy euro and " +
        "pound trading\n" +
        "- **New York session** — overlaps with London for a few hours, " +
        "often the most active window of the day\n\n" +
        "## Why this matters\n\n" +
        "Volatility and trading volume aren't constant throughout the day — " +
        "they rise and fall with these sessions, which affects how much a " +
        "price might move while you're watching it."
    },
    {
      title: "Common Beginner Mistakes",
      slug: "common-beginner-mistakes",
      summary: "The habits that trip up new traders most often, and how to steer clear of them from day one.",
      image: "lesson-08.jpg",
      order: 8,
      body:
        "Most beginner losses come from a small set of repeatable mistakes " +
        "— not bad luck.\n\n" +
        "## Watch out for these\n\n" +
        "- **Over-leveraging** — using more borrowed buying power than your " +
        "account can safely absorb\n" +
        "- **No risk plan** — trading without ever deciding, in advance, how " +
        "much you're willing to lose\n" +
        "- **Chasing losses** — increasing position size to \"win back\" a " +
        "previous loss, which usually compounds the damage\n" +
        "- **Skipping practice** — going straight to a real account instead " +
        "of building comfort on a demo first\n\n" +
        "## The fix is almost always the same\n\n" +
        "Slow down, keep position sizes small while you're learning, and " +
        "treat your first few months as tuition, not income."
    }
  ];

  seedBtn.addEventListener("click", function () {
    if (
      !window.confirm(
        "This will add 8 starter lessons to the database. If you've already " +
          "seeded before, this will create duplicates. Continue?"
      )
    ) {
      return;
    }

    seedBtn.disabled = true;
    seedBtn.textContent = "Seeding…";

    var creates = STARTER_LESSONS.map(function (lesson) {
      return databases.createDocument({
        databaseId: window.PIPDESK_DATABASE_ID,
        collectionId: window.PIPDESK_LESSONS_COLLECTION_ID,
        documentId: Appwrite.ID.unique(),
        data: {
          title: lesson.title,
          slug: lesson.slug,
          summary: lesson.summary,
          image: lesson.image,
          order: lesson.order,
          published: true,
          body: lesson.body
        },
        permissions: [
          Appwrite.Permission.read(Appwrite.Role.users()),
          Appwrite.Permission.update(Appwrite.Role.team(window.PIPDESK_ADMIN_TEAM_ID)),
          Appwrite.Permission.delete(Appwrite.Role.team(window.PIPDESK_ADMIN_TEAM_ID))
        ]
      });
    });

    Promise.all(creates)
      .then(function () {
        showAlert("Seeded 8 starter lessons.", "success");
        loadLessons();
      })
      .catch(function (error) {
        showAlert(error.message || "Seeding failed partway through.", "error");
        loadLessons();
      })
      .then(function () {
        seedBtn.disabled = false;
        seedBtn.textContent = "Seed 8 starter lessons";
      });
  });

  loadLessons();
})();
