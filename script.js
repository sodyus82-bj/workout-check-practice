const SUPABASE_URL = "https://cithfqbzszgiqjifhrqy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_0mGHHS1HcRHh0Ttt8sZwtA_MBI22p1w";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

const routineImage = document.querySelector("#routineImage");
if (
  "serviceWorker" in navigator &&
  window.location.protocol !== "file:"
) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./service-worker.js")
      .catch((error) => {
        console.error("서비스워커 등록 실패:", error);
      });
  });
}
// 홈 화면 설치 기능
const installButton = document.getElementById("installButton");

let deferredInstallPrompt = null;

const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);

const isStandalone =
  window.matchMedia("(display-mode: standalone)").matches ||
  window.navigator.standalone === true;

// 이미 설치된 상태가 아니라면 버튼 표시
if (!isStandalone) {
  installButton.hidden = false;

  if (isIos) {
    installButton.textContent = "📲 아이폰 설치 방법";
  }
}

// 안드로이드·PC에서 설치 준비가 완료되었을 때
window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  installButton.hidden = false;
});

// 설치 버튼 클릭
installButton.addEventListener("click", async () => {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();

    const choice = await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;

    if (choice.outcome === "accepted") {
      installButton.hidden = true;
    }

    return;
  }

  if (isIos) {
    alert(
      "Safari의 공유 버튼을 누른 뒤 ‘홈 화면에 추가’를 선택하고, 마지막으로 ‘추가’를 눌러주세요."
    );
    return;
  }

  alert("브라우저 메뉴에서 ‘앱 설치’ 또는 ‘홈 화면에 추가’를 선택해주세요.");
});

// 설치가 완료되면 버튼 숨기기
window.addEventListener("appinstalled", () => {
  installButton.hidden = true;
  deferredInstallPrompt = null;
});
// 로그인과 화면 전환에 필요한 요소
const loginScreen = document.querySelector("#loginScreen");
const appScreen = document.querySelector("#appScreen");
const adminScreen = document.querySelector("#adminScreen");
// 회원 화면 하단 탭
const memberTabButtons =
  document.querySelectorAll("[data-member-tab]");

const memberTabPanels = {
  routine: document.querySelector("#routineTabPanel"),
  workoutLog: document.querySelector("#workoutLogTabPanel"),
  community: document.querySelector("#communityTabPanel")
};

// 회원 센터 커뮤니티 요소
const communityPostList =
  document.querySelector(
    "#communityPostList"
  );

const communityStatusMessage =
  document.querySelector(
    "#communityStatusMessage"
  );

// 선택한 회원 탭 표시
function showMemberTab(tabName) {
  const selectedPanel = memberTabPanels[tabName];

  if (!selectedPanel) {
    return;
  }

  Object.entries(memberTabPanels).forEach(
    ([panelName, panel]) => {
      panel.hidden = panelName !== tabName;
    }
  );

  memberTabButtons.forEach((button) => {
    const isSelected =
      button.dataset.memberTab === tabName;

    button.classList.toggle("is-active", isSelected);
    button.setAttribute(
      "aria-selected",
      String(isSelected)
    );
  });

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

// 하단 탭 버튼 클릭 기능
memberTabButtons.forEach((button) => {
  button.addEventListener("click", function () {
    showMemberTab(button.dataset.memberTab);
  });
});

// 센터 소식 이미지 캐러셀 만들기
function createCommunityImageCarousel(
  postImages,
  postTitle
) {
  const carouselArea =
    document.createElement("div");

  carouselArea.className =
    "community-carousel-area";

  const imageCarousel =
    document.createElement("div");

  imageCarousel.className =
    "community-image-carousel";

  imageCarousel.setAttribute(
    "aria-label",
    `${postTitle} 이미지`
  );

  postImages.forEach(
    function (image, index) {
      const imageSlide =
        document.createElement("div");

      imageSlide.className =
        "community-image-slide";

      const postImage =
        document.createElement("img");

      postImage.src = image.signedUrl;
      postImage.alt =
        image.alt_text ||
        `${postTitle} 이미지 ${index + 1}`;

      postImage.draggable = false;

      imageSlide.append(postImage);
      imageCarousel.append(imageSlide);
    }
  );

  carouselArea.append(imageCarousel);

  // 이미지가 한 장이면 조작 버튼을 만들지 않음
  if (postImages.length <= 1) {
    return carouselArea;
  }

  imageCarousel.classList.add(
    "has-multiple-images"
  );

  const carouselControls =
    document.createElement("div");

  carouselControls.className =
    "community-carousel-controls";

  const previousButton =
    document.createElement("button");

  previousButton.type = "button";
  previousButton.className =
    "community-carousel-button";
  previousButton.textContent = "‹";
  previousButton.setAttribute(
    "aria-label",
    "이전 사진 보기"
  );

  const dotContainer =
    document.createElement("div");

  dotContainer.className =
    "community-carousel-dots";

  const nextButton =
    document.createElement("button");

  nextButton.type = "button";
  nextButton.className =
    "community-carousel-button";
  nextButton.textContent = "›";
  nextButton.setAttribute(
    "aria-label",
    "다음 사진 보기"
  );

  const indicatorDots =
    postImages.map(
      function (_, index) {
        const dot =
          document.createElement("button");

        dot.type = "button";
        dot.className =
          "community-carousel-dot";

        dot.setAttribute(
          "aria-label",
          `${index + 1}번 사진 보기`
        );

        dotContainer.append(dot);

        return dot;
      }
    );

  let currentSlideIndex = 0;

  function updateCarouselControls(index) {
    currentSlideIndex = Math.max(
      0,
      Math.min(
        index,
        postImages.length - 1
      )
    );

    previousButton.disabled =
      currentSlideIndex === 0;

    nextButton.disabled =
      currentSlideIndex ===
      postImages.length - 1;

    indicatorDots.forEach(
      function (dot, dotIndex) {
        const isCurrent =
          dotIndex === currentSlideIndex;

        dot.classList.toggle(
          "is-active",
          isCurrent
        );

        dot.setAttribute(
          "aria-current",
          isCurrent ? "true" : "false"
        );
      }
    );
  }

  function moveToSlide(index) {
    const nextIndex = Math.max(
      0,
      Math.min(
        index,
        postImages.length - 1
      )
    );

    imageCarousel.scrollTo({
      left:
        imageCarousel.clientWidth *
        nextIndex,
      behavior: "smooth"
    });

    updateCarouselControls(nextIndex);
  }

  previousButton.addEventListener(
    "click",
    function () {
      moveToSlide(
        currentSlideIndex - 1
      );
    }
  );

  nextButton.addEventListener(
    "click",
    function () {
      moveToSlide(
        currentSlideIndex + 1
      );
    }
  );

  indicatorDots.forEach(
    function (dot, index) {
      dot.addEventListener(
        "click",
        function () {
          moveToSlide(index);
        }
      );
    }
  );

  // 손가락으로 넘겼을 때 점 표시 변경
  imageCarousel.addEventListener(
    "scroll",
    function () {
      if (!imageCarousel.clientWidth) {
        return;
      }

      const visibleIndex = Math.round(
        imageCarousel.scrollLeft /
        imageCarousel.clientWidth
      );

      updateCarouselControls(
        visibleIndex
      );
    }
  );

  // PC 마우스 드래그 지원
  let isMouseDragging = false;
  let dragStartX = 0;
  let dragStartScrollLeft = 0;

  imageCarousel.addEventListener(
    "pointerdown",
    function (event) {
      if (
        event.pointerType !== "mouse" ||
        event.button !== 0
      ) {
        return;
      }

      isMouseDragging = true;
      dragStartX = event.clientX;
      dragStartScrollLeft =
        imageCarousel.scrollLeft;

      imageCarousel.classList.add(
        "is-dragging"
      );

      imageCarousel.setPointerCapture(
        event.pointerId
      );

      event.preventDefault();
    }
  );

  imageCarousel.addEventListener(
    "pointermove",
    function (event) {
      if (!isMouseDragging) {
        return;
      }

      const movedDistance =
        event.clientX - dragStartX;

      imageCarousel.scrollLeft =
        dragStartScrollLeft -
        movedDistance;

      event.preventDefault();
    }
  );

  function finishMouseDrag(event) {
    if (!isMouseDragging) {
      return;
    }

    isMouseDragging = false;

    imageCarousel.classList.remove(
      "is-dragging"
    );

    const nearestIndex = Math.round(
      imageCarousel.scrollLeft /
      imageCarousel.clientWidth
    );

    moveToSlide(nearestIndex);

    if (
      imageCarousel.hasPointerCapture(
        event.pointerId
      )
    ) {
      imageCarousel.releasePointerCapture(
        event.pointerId
      );
    }
  }

  imageCarousel.addEventListener(
    "pointerup",
    finishMouseDrag
  );

  imageCarousel.addEventListener(
    "pointercancel",
    finishMouseDrag
  );

  carouselControls.append(
    previousButton,
    dotContainer,
    nextButton
  );

  carouselArea.append(
    carouselControls
  );

  updateCarouselControls(0);

  return carouselArea;
}

// 회원 화면에 센터 소식 표시
function renderCommunityPosts(posts) {
  communityPostList.innerHTML = "";

  if (!posts || posts.length === 0) {
    communityStatusMessage.textContent =
      "아직 등록된 센터 소식이 없습니다.";

    communityPostList.append(
      communityStatusMessage
    );

    return;
  }

  posts.forEach(function (post) {
    const postCard =
      document.createElement("article");

    postCard.className =
      "community-post-card";

    const postImages =
      post.community_post_images || [];

    const imageCarousel =
      createCommunityImageCarousel(
        postImages,
        post.title
      );

    const postContent =
      document.createElement("div");

    postContent.className =
      "community-post-content";

    const postTitle =
      document.createElement("h2");

    postTitle.className =
      "community-post-title";

    postTitle.textContent = post.title;

    const postBody =
      document.createElement("p");

    postBody.className =
      "community-post-body";

    appendTextWithLinks(
      postBody,
      post.body || ""
    );

    const postDate =
      document.createElement("time");

    postDate.className =
      "community-post-date";

    postDate.dateTime =
      post.published_at || "";

    postDate.textContent =
      new Intl.DateTimeFormat(
        "ko-KR",
        {
          year: "numeric",
          month: "long",
          day: "numeric"
        }
      ).format(
        new Date(post.published_at)
      );

    postContent.append(
      postTitle,
      postBody
    );


    postContent.append(postDate);

    postCard.append(
      imageCarousel,
      postContent
    );

    communityPostList.append(postCard);
  });
}


// 공개된 센터 소식 불러오기
async function loadCommunityPosts() {
  communityPostList.replaceChildren(
    communityStatusMessage
  );

  communityStatusMessage.textContent =
    "센터 소식을 불러오고 있습니다.";

  try {
    const {
      data: posts,
      error: postsError
    } = await supabaseClient
      .from("community_posts")
      .select(`
        id,
        title,
        body,
        published_at,
        community_post_images (
          id,
          storage_path,
          alt_text,
          sort_order
        )
      `)
      .eq("is_published", true)
      .order(
        "published_at",
        { ascending: false }
      );

    if (postsError) {
      throw postsError;
    }

    const postsWithImages =
      await Promise.all(
        (posts || []).map(
          async function (post) {
            const sortedImages = [
              ...(post.community_post_images || [])
            ].sort(function (first, second) {
              return (
                first.sort_order -
                second.sort_order
              );
            });

            const imagesWithUrls =
              await Promise.all(
                sortedImages.map(
                  async function (image) {
                    const {
                      data: signedImageData,
                      error: signedImageError
                    } =
                      await supabaseClient.storage
                        .from("community-images")
                        .createSignedUrl(
                          image.storage_path,
                          3600
                        );

                    if (signedImageError) {
                      throw signedImageError;
                    }

                    return {
                      ...image,
                      signedUrl:
                        signedImageData.signedUrl
                    };
                  }
                )
              );

            return {
              ...post,
              community_post_images:
                imagesWithUrls
            };
          }
        )
      );

    renderCommunityPosts(
      postsWithImages
    );

  } catch (loadError) {
    console.error(
      "센터 소식 불러오기 실패:",
      loadError
    );

    communityStatusMessage.textContent =
      `센터 소식을 불러오지 못했습니다: ${loadError.message ||
      "알 수 없는 오류"
      }`;

    communityPostList.replaceChildren(
      communityStatusMessage
    );
  }
}

// 운동 기록 캘린더 요소
const workoutCalendarMonthLabel =
  document.querySelector("#workoutCalendarMonthLabel");

const workoutCalendarDays =
  document.querySelector("#workoutCalendarDays");

const previousWorkoutMonthButton =
  document.querySelector("#previousWorkoutMonthButton");

const nextWorkoutMonthButton =
  document.querySelector("#nextWorkoutMonthButton");

// 현재 캘린더에 표시할 월
let visibleWorkoutMonth = new Date();
visibleWorkoutMonth.setDate(1);

// 나중에 Supabase에서 불러올 기록 날짜
let workoutRecordDates = new Set();

// 운동 기록을 표시할 영역
const workoutRecordList =
  document.querySelector("#workoutRecordList");

const emptyWorkoutRecordMessage =
  document.querySelector("#emptyWorkoutRecordMessage");

// 서버에서 불러온 운동 기록
let workoutRecords = [];

// 현재 기록을 조회하는 회원
let workoutRecordsUserId = "";

// 이전 조회 결과가 뒤늦게 표시되는 것을 방지
let workoutRecordsRequestId = 0;

// 사용자가 선택한 날짜
let selectedWorkoutDate = "";

// 날짜를 2026-09-22 형태로 만들기
function makeWorkoutDateKey(year, monthIndex, day) {
  const month = String(monthIndex + 1).padStart(2, "0");
  const date = String(day).padStart(2, "0");

  return `${year}-${month}-${date}`;
}
// 운동 기록의 날짜를 2026-09-22 형태로 변환
function getWorkoutRecordDateKey(takenAt) {
  const recordDate = new Date(takenAt);

  return makeWorkoutDateKey(
    recordDate.getFullYear(),
    recordDate.getMonth(),
    recordDate.getDate()
  );
}

// 저장된 운동 기록 목록 표시
function renderWorkoutRecords() {
  workoutRecordList.innerHTML = "";

  const recordsToShow = selectedWorkoutDate
    ? workoutRecords.filter((record) => {
      return (
        getWorkoutRecordDateKey(record.taken_at) ===
        selectedWorkoutDate
      );
    })
    : workoutRecords;

  if (recordsToShow.length === 0) {
    emptyWorkoutRecordMessage.textContent =
      selectedWorkoutDate
        ? "선택한 날짜에는 저장된 운동 기록이 없습니다."
        : "아직 저장된 운동 기록이 없습니다.";

    workoutRecordList.append(
      emptyWorkoutRecordMessage
    );

    return;
  }

  recordsToShow.forEach((record) => {
    const recordCard =
      document.createElement("article");

    recordCard.className =
      "workout-record-card";

    const recordImage =
      document.createElement("img");

    recordImage.className =
      "workout-record-photo";

    recordImage.src = record.signedUrl;
    recordImage.alt =
      record.caption || "운동 기록 사진";
    recordImage.loading = "lazy";

    const recordCaption =
      document.createElement("p");

    recordCaption.className =
      "workout-record-caption";

    recordCaption.textContent =
      record.caption || "";

    const recordDate =
      document.createElement("time");

    recordDate.className =
      "workout-record-date";

    recordDate.dateTime = record.taken_at;

    recordDate.textContent =
      new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date(record.taken_at));

    const captionEditor =
      document.createElement("textarea");

    captionEditor.className =
      "workout-record-caption-editor";
    captionEditor.value = record.caption || "";
    captionEditor.maxLength = 120;
    captionEditor.rows = 3;
    captionEditor.hidden = true;
    captionEditor.setAttribute(
      "aria-label",
      "운동 기록 메모 수정"
    );

    const editActions =
      document.createElement("div");

    editActions.className =
      "workout-record-edit-actions";
    editActions.hidden = true;

    const cancelEditButton =
      document.createElement("button");

    cancelEditButton.type = "button";
    cancelEditButton.className =
      "cancel-workout-caption-button";
    cancelEditButton.textContent = "취소";

    const saveEditButton =
      document.createElement("button");

    saveEditButton.type = "button";
    saveEditButton.className =
      "save-workout-caption-button";
    saveEditButton.textContent = "저장";

    editActions.append(
      cancelEditButton,
      saveEditButton
    );

    const recordFooter =
      document.createElement("div");

    recordFooter.className =
      "workout-record-footer";

    const recordButtons =
      document.createElement("div");

    recordButtons.className =
      "workout-record-buttons";

    const editButton =
      document.createElement("button");

    editButton.type = "button";
    editButton.className =
      "edit-workout-record-button";
    editButton.textContent = "수정";

    const deleteButton =
      document.createElement("button");

    deleteButton.type = "button";
    deleteButton.className =
      "delete-workout-record-button";
    deleteButton.textContent = "삭제하기";

    deleteButton.setAttribute(
      "aria-label",
      "이 운동 기록 삭제하기"
    );

    editButton.addEventListener(
      "click",
      function () {
        captionEditor.value =
          record.caption || "";

        recordCaption.hidden = true;
        recordFooter.hidden = true;
        captionEditor.hidden = false;
        editActions.hidden = false;

        captionEditor.focus();
        captionEditor.setSelectionRange(
          captionEditor.value.length,
          captionEditor.value.length
        );
      }
    );

    cancelEditButton.addEventListener(
      "click",
      function () {
        captionEditor.value =
          record.caption || "";

        captionEditor.hidden = true;
        editActions.hidden = true;
        recordCaption.hidden = false;
        recordFooter.hidden = false;
      }
    );

    saveEditButton.addEventListener(
      "click",
      async function () {
        await updateWorkoutRecordCaption(
          record,
          captionEditor.value,
          saveEditButton
        );
      }
    );

    deleteButton.addEventListener(
      "click",
      function () {
        deleteWorkoutRecord(
          record,
          deleteButton
        );
      }
    );

    recordButtons.append(
      editButton,
      deleteButton
    );

    recordFooter.append(
      recordDate,
      recordButtons
    );

    recordCard.append(
      recordImage,
      recordCaption,
      captionEditor,
      editActions,
      recordFooter
    );

    workoutRecordList.append(recordCard);
  });
}

// 로그인한 회원의 운동 기록 불러오기
async function loadWorkoutRecords(userId) {
  const currentRequestId =
    ++workoutRecordsRequestId;

  workoutRecordsUserId = userId;

  workoutRecordList.innerHTML = "";
  emptyWorkoutRecordMessage.textContent =
    "운동 기록을 불러오는 중입니다.";

  workoutRecordList.append(
    emptyWorkoutRecordMessage
  );

  const {
    data: records,
    error: recordsError
  } = await supabaseClient
    .from("workout_records")
    .select(
      "id, photo_path, caption, taken_at"
    )
    .eq("user_id", userId)
    .order("taken_at", {
      ascending: false
    });

  if (
    currentRequestId !==
    workoutRecordsRequestId
  ) {
    return;
  }

  if (recordsError) {
    console.error(
      "운동 기록 불러오기 실패:",
      recordsError
    );

    workoutRecords = [];
    workoutRecordDates = new Set();

    emptyWorkoutRecordMessage.textContent =
      "운동 기록을 불러오지 못했습니다.";

    renderWorkoutCalendar();
    return;
  }

  const recordsWithSignedUrls =
    await Promise.all(
      (records || []).map(async (record) => {
        const {
          data: signedUrlData,
          error: signedUrlError
        } = await supabaseClient.storage
          .from("workout-photos")
          .createSignedUrl(
            record.photo_path,
            3600
          );

        if (signedUrlError) {
          console.error(
            "운동 기록 사진 주소 생성 실패:",
            signedUrlError
          );

          return null;
        }

        return {
          ...record,
          signedUrl:
            signedUrlData.signedUrl
        };
      })
    );

  if (
    currentRequestId !==
    workoutRecordsRequestId
  ) {
    return;
  }

  workoutRecords =
    recordsWithSignedUrls.filter(Boolean);

  workoutRecordDates = new Set(
    workoutRecords.map((record) => {
      return getWorkoutRecordDateKey(
        record.taken_at
      );
    })
  );

  renderWorkoutCalendar();
  renderWorkoutRecords();
}

// 회원 본인의 운동 기록 삭제
async function deleteWorkoutRecord(
  record,
  deleteButton
) {
  const shouldDelete = window.confirm(
    "이 운동 기록을 삭제할까요?\n삭제한 사진은 복구할 수 없습니다."
  );

  if (!shouldDelete) {
    return;
  }

  deleteButton.disabled = true;
  deleteButton.textContent = "삭제 중...";

  try {
    const {
      data: { user },
      error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error(
        "로그인 정보를 확인할 수 없습니다."
      );
    }

    const {
      data: deletedRecords,
      error: recordDeleteError
    } = await supabaseClient
      .from("workout_records")
      .delete()
      .eq("id", record.id)
      .eq("user_id", user.id)
      .select("id");

    if (recordDeleteError) {
      throw recordDeleteError;
    }

    if (
      !deletedRecords ||
      deletedRecords.length === 0
    ) {
      throw new Error(
        "삭제할 운동 기록을 찾을 수 없습니다."
      );
    }

    const { error: photoDeleteError } =
      await supabaseClient.storage
        .from("workout-photos")
        .remove([record.photo_path]);

    if (photoDeleteError) {
      console.error(
        "운동 기록 사진 파일 삭제 실패:",
        photoDeleteError
      );
    }

    await loadWorkoutRecords(user.id);

  } catch (deleteError) {
    console.error(
      "운동 기록 삭제 실패:",
      deleteError
    );

    alert(
      `운동 기록을 삭제하지 못했습니다.\n${deleteError.message ||
      "알 수 없는 오류"
      }`
    );

    deleteButton.disabled = false;
    deleteButton.textContent = "삭제하기";
  }
}

// 회원 본인의 운동 기록 메모 수정
async function updateWorkoutRecordCaption(
  record,
  newCaption,
  saveButton
) {
  saveButton.disabled = true;
  saveButton.textContent = "저장 중...";

  try {
    const {
      data: { user },
      error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error(
        "로그인 정보를 확인할 수 없습니다."
      );
    }

    const {
      data: updatedRecords,
      error: updateError
    } = await supabaseClient
      .from("workout_records")
      .update({
        caption: newCaption.trim()
      })
      .eq("id", record.id)
      .eq("user_id", user.id)
      .select("id");

    if (updateError) {
      throw updateError;
    }

    if (
      !updatedRecords ||
      updatedRecords.length === 0
    ) {
      throw new Error(
        "수정할 운동 기록을 찾을 수 없습니다."
      );
    }

    await loadWorkoutRecords(user.id);

  } catch (updateError) {
    console.error(
      "운동 기록 메모 수정 실패:",
      updateError
    );

    alert(
      `운동 기록을 수정하지 못했습니다.\n${updateError.message ||
      "알 수 없는 오류"
      }`
    );

    saveButton.disabled = false;
    saveButton.textContent = "저장";
  }
}

// 운동 기록 캘린더 그리기
function renderWorkoutCalendar() {
  const year = visibleWorkoutMonth.getFullYear();
  const monthIndex = visibleWorkoutMonth.getMonth();

  const firstWeekday =
    new Date(year, monthIndex, 1).getDay();

  const lastDate =
    new Date(year, monthIndex + 1, 0).getDate();

  const today = new Date();

  workoutCalendarMonthLabel.textContent =
    `${year}년 ${monthIndex + 1}월`;

  workoutCalendarDays.innerHTML = "";

  // 이번 달 1일 앞의 빈칸
  for (let index = 0; index < firstWeekday; index += 1) {
    const emptyCell = document.createElement("span");
    emptyCell.className = "workout-calendar-empty";
    emptyCell.setAttribute("aria-hidden", "true");

    workoutCalendarDays.append(emptyCell);
  }

  // 이번 달 날짜
  for (let day = 1; day <= lastDate; day += 1) {
    const dateKey =
      makeWorkoutDateKey(year, monthIndex, day);

    const dateButton = document.createElement("button");

    dateButton.type = "button";
    dateButton.className = "workout-calendar-day";
    dateButton.textContent = String(day);
    dateButton.dataset.date = dateKey;

    dateButton.setAttribute(
      "aria-label",
      `${year}년 ${monthIndex + 1}월 ${day}일`
    );

    const isToday =
      year === today.getFullYear() &&
      monthIndex === today.getMonth() &&
      day === today.getDate();

    if (isToday) {
      dateButton.classList.add("is-today");
    }

    if (workoutRecordDates.has(dateKey)) {
      dateButton.classList.add("has-record");
    }

    if (selectedWorkoutDate === dateKey) {
      dateButton.classList.add("is-selected");
    }

    dateButton.addEventListener("click", function () {
      selectedWorkoutDate =
        selectedWorkoutDate === dateKey
          ? ""
          : dateKey;

      renderWorkoutCalendar();
      renderWorkoutRecords();
    });

    workoutCalendarDays.append(dateButton);
  }
}

// 이전 달 보기
previousWorkoutMonthButton.addEventListener(
  "click",
  function () {
    visibleWorkoutMonth.setMonth(
      visibleWorkoutMonth.getMonth() - 1
    );

    selectedWorkoutDate = "";
    renderWorkoutCalendar();
    renderWorkoutRecords();
  }
);

// 다음 달 보기
nextWorkoutMonthButton.addEventListener(
  "click",
  function () {
    visibleWorkoutMonth.setMonth(
      visibleWorkoutMonth.getMonth() + 1
    );

    selectedWorkoutDate = "";
    renderWorkoutCalendar();
    renderWorkoutRecords();
  }
);

// 로그인할 때 이번 달로 초기화
function resetWorkoutCalendar() {
  visibleWorkoutMonth = new Date();
  visibleWorkoutMonth.setDate(1);
  selectedWorkoutDate = "";

  renderWorkoutCalendar();
}

// 페이지가 처음 열렸을 때 달력 표시
renderWorkoutCalendar();
// 운동 기록 카메라 요소
const openWorkoutCameraButton =
  document.querySelector("#openWorkoutCameraButton");

const workoutNativeCameraInput =
  document.querySelector("#workoutNativeCameraInput");

const workoutCameraModal =
  document.querySelector("#workoutCameraModal");

const closeWorkoutCameraButton =
  document.querySelector("#closeWorkoutCameraButton");

const workoutCameraView =
  document.querySelector("#workoutCameraView");

const workoutCameraVideo =
  document.querySelector("#workoutCameraVideo");

const workoutCameraMessage =
  document.querySelector("#workoutCameraMessage");

const captureWorkoutPhotoButton =
  document.querySelector("#captureWorkoutPhotoButton");

const switchWorkoutCameraButton =
  document.querySelector("#switchWorkoutCameraButton");

const workoutPhotoComposer =
  document.querySelector("#workoutPhotoComposer");

const workoutPhotoCaption =
  document.querySelector("#workoutPhotoCaption");

const workoutRecordSaveMessage =
  document.querySelector("#workoutRecordSaveMessage");
const workoutCameraCanvas =
  document.querySelector("#workoutCameraCanvas");

const workoutPhotoPreview =
  document.querySelector("#workoutPhotoPreview");

const workoutPhotoDate =
  document.querySelector("#workoutPhotoDate");

const retakeWorkoutPhotoButton =
  document.querySelector("#retakeWorkoutPhotoButton");

const saveWorkoutRecordButton =
  document.querySelector("#saveWorkoutRecordButton");

// 현재 실행 중인 카메라 정보
let workoutCameraStream = null;
let workoutCameraFacingMode = "user";
let workoutCameraRequestId = 0;
let capturedWorkoutPhotoBlob = null;
let workoutPhotoPreviewUrl = "";
let workoutPhotoTakenAt = null;

// 촬영한 임시 사진 초기화
function clearCapturedWorkoutPhoto() {
  if (workoutPhotoPreviewUrl) {
    URL.revokeObjectURL(workoutPhotoPreviewUrl);
  }

  workoutPhotoPreviewUrl = "";
  capturedWorkoutPhotoBlob = null;
  workoutPhotoTakenAt = null;

  workoutPhotoPreview.removeAttribute("src");
  workoutPhotoCaption.value = "";
  workoutPhotoDate.textContent = "";
  workoutRecordSaveMessage.textContent = "";

  saveWorkoutRecordButton.disabled = false;
  saveWorkoutRecordButton.textContent = "기록 저장";
}

// 실행 중인 카메라 끄기
function stopWorkoutCamera() {
  workoutCameraRequestId += 1;

  if (workoutCameraStream) {
    workoutCameraStream
      .getTracks()
      .forEach((track) => track.stop());
  }

  workoutCameraStream = null;
  workoutCameraVideo.srcObject = null;
}

// 카메라 시작
async function startWorkoutCamera() {
  stopWorkoutCamera();

  const currentRequestId = workoutCameraRequestId;

  workoutCameraMessage.hidden = false;
  workoutCameraMessage.textContent =
    "카메라를 준비하고 있습니다.";

  captureWorkoutPhotoButton.disabled = true;
  switchWorkoutCameraButton.disabled = true;

  workoutCameraVideo.classList.toggle(
    "is-front-facing",
    workoutCameraFacingMode === "user"
  );

  try {
    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      throw new Error("CAMERA_NOT_SUPPORTED");
    }

    const cameraStream =
      await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: {
            ideal: workoutCameraFacingMode
          },
          width: {
            ideal: 1200
          },
          height: {
            ideal: 1600
          },
          aspectRatio: {
            ideal: 3 / 4
          },
          resizeMode: "crop-and-scale"
        }
      });

    // 기다리는 동안 화면을 닫았거나 다른 카메라로 바꾼 경우
    if (
      currentRequestId !== workoutCameraRequestId ||
      workoutCameraModal.hidden
    ) {
      cameraStream
        .getTracks()
        .forEach((track) => track.stop());

      return;
    }

    workoutCameraStream = cameraStream;
    workoutCameraVideo.srcObject = cameraStream;

    await workoutCameraVideo.play();

    workoutCameraMessage.hidden = true;
    captureWorkoutPhotoButton.disabled = false;

  } catch (cameraError) {
    console.error("카메라 실행 실패:", cameraError);

    workoutCameraMessage.hidden = false;

    if (cameraError.name === "NotAllowedError") {
      workoutCameraMessage.textContent =
        "카메라 권한이 필요합니다. " +
        "브라우저 설정에서 카메라 사용을 허용해 주세요.";

    } else if (cameraError.name === "NotFoundError") {
      workoutCameraMessage.textContent =
        "사용할 수 있는 카메라를 찾지 못했습니다.";

    } else if (window.location.protocol === "file:") {
      workoutCameraMessage.textContent =
        "로컬 파일에서는 카메라가 제한될 수 있습니다. " +
        "GitHub Pages에 올린 앱에서 다시 확인해 주세요.";

    } else {
      workoutCameraMessage.textContent =
        "카메라를 실행하지 못했습니다. " +
        "잠시 후 다시 시도해 주세요.";
    }

  } finally {
    switchWorkoutCameraButton.disabled = false;
  }
}

// 카메라 화면 열기
async function openWorkoutCamera() {
  workoutCameraModal.hidden = false;
  workoutCameraView.hidden = false;
  workoutPhotoComposer.hidden = true;

  workoutRecordSaveMessage.textContent = "";

  document.body.classList.add("camera-open");

  workoutCameraFacingMode = "user";

  await startWorkoutCamera();
}

// 카메라 화면 닫기
function closeWorkoutCamera() {
  stopWorkoutCamera();
  clearCapturedWorkoutPhoto();

  workoutCameraModal.hidden = true;
  workoutCameraView.hidden = false;
  workoutPhotoComposer.hidden = true;

  document.body.classList.remove("camera-open");
}

// 전면·후면 카메라 전환
async function switchWorkoutCamera() {
  workoutCameraFacingMode =
    workoutCameraFacingMode === "user"
      ? "environment"
      : "user";

  await startWorkoutCamera();
}
// 현재 카메라 화면 촬영
async function captureWorkoutPhoto() {
  const sourceWidth = workoutCameraVideo.videoWidth;
  const sourceHeight = workoutCameraVideo.videoHeight;

  if (!sourceWidth || !sourceHeight) {
    workoutCameraMessage.hidden = false;
    workoutCameraMessage.textContent =
      "카메라 준비가 끝난 뒤 다시 촬영해 주세요.";

    return;
  }

  captureWorkoutPhotoButton.disabled = true;

  try {
    const maximumSize = 1600;

    const imageScale = Math.min(
      1,
      maximumSize / Math.max(sourceWidth, sourceHeight)
    );

    workoutCameraCanvas.width =
      Math.round(sourceWidth * imageScale);

    workoutCameraCanvas.height =
      Math.round(sourceHeight * imageScale);

    const drawingContext =
      workoutCameraCanvas.getContext("2d");

    drawingContext.save();

    // 전면 카메라는 화면에 보이는 방향대로 저장
    if (workoutCameraFacingMode === "user") {
      drawingContext.translate(
        workoutCameraCanvas.width,
        0
      );

      drawingContext.scale(-1, 1);
    }

    drawingContext.drawImage(
      workoutCameraVideo,
      0,
      0,
      workoutCameraCanvas.width,
      workoutCameraCanvas.height
    );

    drawingContext.restore();

    const photoBlob = await new Promise((resolve) => {
      workoutCameraCanvas.toBlob(
        resolve,
        "image/jpeg",
        0.82
      );
    });

    if (!photoBlob) {
      throw new Error("PHOTO_CREATION_FAILED");
    }

    clearCapturedWorkoutPhoto();

    capturedWorkoutPhotoBlob = photoBlob;
    workoutPhotoTakenAt = new Date();

    workoutPhotoPreviewUrl =
      URL.createObjectURL(photoBlob);

    workoutPhotoPreview.src =
      workoutPhotoPreviewUrl;

    workoutPhotoDate.textContent =
      new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }).format(workoutPhotoTakenAt);

    stopWorkoutCamera();

    workoutCameraView.hidden = true;
    workoutPhotoComposer.hidden = false;

    workoutPhotoCaption.focus();

  } catch (photoError) {
    console.error("사진 촬영 실패:", photoError);

    workoutCameraMessage.hidden = false;
    workoutCameraMessage.textContent =
      "사진을 만들지 못했습니다. 다시 촬영해 주세요.";

  } finally {
    captureWorkoutPhotoButton.disabled = false;
  }
}

// 다시 찍기
function retakeWorkoutPhoto() {
  workoutNativeCameraInput.value = "";
  workoutNativeCameraInput.click();
}
async function saveWorkoutRecord() {
  if (
    !capturedWorkoutPhotoBlob ||
    !workoutPhotoTakenAt
  ) {
    workoutRecordSaveMessage.textContent =
      "저장할 사진이 없습니다.";
    return;
  }

  saveWorkoutRecordButton.disabled = true;
  saveWorkoutRecordButton.textContent = "저장 중...";
  workoutRecordSaveMessage.textContent =
    "운동 기록을 저장하고 있습니다.";

  let uploadedPhotoPath = "";

  try {
    const {
      data: { user },
      error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error("로그인 정보를 확인할 수 없습니다.");
    }

    const photoMimeType =
      capturedWorkoutPhotoBlob.type || "image/jpeg";

    const extensionByMimeType = {
      "image/png": "png",
      "image/webp": "webp",
      "image/heic": "heic",
      "image/heif": "heif"
    };

    const photoExtension =
      extensionByMimeType[photoMimeType] || "jpg";

    const uniqueId =
      typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()
          .toString(16)
          .slice(2)}`;

    uploadedPhotoPath =
      `${user.id}/${Date.now()}-${uniqueId}.${photoExtension}`;

    const { error: uploadError } =
      await supabaseClient.storage
        .from("workout-photos")
        .upload(
          uploadedPhotoPath,
          capturedWorkoutPhotoBlob,
          {
            contentType: photoMimeType,
            cacheControl: "3600",
            upsert: false
          }
        );

    if (uploadError) {
      throw uploadError;
    }

    const { error: recordError } =
      await supabaseClient
        .from("workout_records")
        .insert({
          user_id: user.id,
          photo_path: uploadedPhotoPath,
          caption:
            workoutPhotoCaption.value.trim(),
          taken_at:
            workoutPhotoTakenAt.toISOString()
        });

    if (recordError) {
      const { error: cleanupError } =
        await supabaseClient.storage
          .from("workout-photos")
          .remove([uploadedPhotoPath]);

      if (cleanupError) {
        console.error(
          "저장 실패 사진 정리 오류:",
          cleanupError
        );
      }

      throw recordError;
    }

    // 저장한 날짜의 달력과 기록 목록 새로고침
    visibleWorkoutMonth =
      new Date(workoutPhotoTakenAt);

    visibleWorkoutMonth.setDate(1);
    selectedWorkoutDate = "";

    await loadWorkoutRecords(user.id);
    workoutRecordSaveMessage.textContent =
      "운동 기록을 저장했습니다.";

    saveWorkoutRecordButton.textContent =
      "저장 완료";

    setTimeout(function () {
      closeWorkoutCamera();
    }, 800);

  } catch (saveError) {
    console.error(
      "운동 기록 저장 실패:",
      saveError
    );

    workoutRecordSaveMessage.textContent =
      `저장 실패: ${saveError.message || "알 수 없는 오류"}`;

    saveWorkoutRecordButton.disabled = false;
    saveWorkoutRecordButton.textContent =
      "기록 저장";
  }
}

// 카메라 버튼 기능 연결
openWorkoutCameraButton.addEventListener(
  "click",
  function () {
    workoutNativeCameraInput.value = "";
    workoutNativeCameraInput.click();
  }
);

workoutNativeCameraInput.addEventListener(
  "change",
  function () {
    const capturedFile =
      workoutNativeCameraInput.files[0];

    // 촬영을 취소한 경우 아무 작업도 하지 않음
    if (!capturedFile) {
      return;
    }

    clearCapturedWorkoutPhoto();
    stopWorkoutCamera();

    capturedWorkoutPhotoBlob = capturedFile;
    workoutPhotoTakenAt = new Date();
    workoutPhotoPreviewUrl =
      URL.createObjectURL(capturedFile);

    workoutPhotoPreview.src =
      workoutPhotoPreviewUrl;

    workoutPhotoDate.textContent =
      new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }).format(workoutPhotoTakenAt);

    workoutCameraModal.hidden = false;
    workoutCameraView.hidden = true;
    workoutPhotoComposer.hidden = false;

    document.body.classList.add("camera-open");

    workoutPhotoCaption.focus();
  }
);

closeWorkoutCameraButton.addEventListener(
  "click",
  closeWorkoutCamera
);

switchWorkoutCameraButton.addEventListener(
  "click",
  switchWorkoutCamera
);
captureWorkoutPhotoButton.addEventListener(
  "click",
  captureWorkoutPhoto
);

retakeWorkoutPhotoButton.addEventListener(
  "click",
  retakeWorkoutPhoto
);
saveWorkoutRecordButton.addEventListener(
  "click",
  saveWorkoutRecord
);
const loginForm = document.querySelector("#loginForm");
const loginEmail = document.querySelector("#loginEmail");
const loginPassword = document.querySelector("#loginPassword");
const loginButton = document.querySelector("#loginButton");
const loginMessage = document.querySelector("#loginMessage");
const showSignupButton = document.querySelector("#showSignupButton");
const signupForm = document.querySelector("#signupForm");
const signupName = document.querySelector("#signupName");
const signupPhoneLast4 = document.querySelector("#signupPhoneLast4");
const signupEmail = document.querySelector("#signupEmail");
const signupPassword = document.querySelector("#signupPassword");
const signupPasswordConfirm = document.querySelector(
  "#signupPasswordConfirm"
);
const signupButton = document.querySelector("#signupButton");
const signupMessage = document.querySelector("#signupMessage");
const hideSignupButton = document.querySelector("#hideSignupButton");
const assignedRoutineName = document.querySelector("#assignedRoutineName");
const routineDescription = document.querySelector("#routineDescription");
const toggleRoutineDescriptionButton = document.querySelector(
  "#toggleRoutineDescriptionButton"
);
const logoutButton = document.querySelector("#logoutButton");
const refreshMemberAppButton =
  document.querySelector("#refreshMemberAppButton");

refreshMemberAppButton.addEventListener(
  "click",
  function () {
    refreshMemberAppButton.disabled = true;
    refreshMemberAppButton.lastElementChild.textContent =
      "갱신 중...";

    setTimeout(function () {
      window.location.reload();
    }, 150);
  }
);
const adminMemberSearch = document.querySelector("#adminMemberSearch");
const adminMemberSelect = document.querySelector("#adminMemberSelect");
const adminMemberInfo = document.querySelector("#adminMemberInfo");

let adminMemberOptionCache = [];
const adminRoutineEditor = document.querySelector("#adminRoutineEditor");
const adminLogoutButton = document.querySelector("#adminLogoutButton");
const adminRoutineName = document.querySelector("#adminRoutineName");
const adminRoutineImage = document.querySelector("#adminRoutineImage");
const adminRoutinePreview = document.querySelector("#adminRoutinePreview");
const adminRoutineDescription = document.querySelector("#adminRoutineDescription");
const saveAdminRoutineButton = document.querySelector("#saveAdminRoutineButton");
const adminSaveMessage = document.querySelector("#adminSaveMessage");

// 관리자 센터 소식 작성 요소
const adminCommunityEditorTitle =
  document.querySelector(
    "#adminCommunityEditorTitle"
  );

const adminCommunityTitle =
  document.querySelector(
    "#adminCommunityTitle"
  );

const adminCommunityImages =
  document.querySelector(
    "#adminCommunityImages"
  );

const adminCommunityImagePreview =
  document.querySelector(
    "#adminCommunityImagePreview"
  );

const adminCommunityBody =
  document.querySelector(
    "#adminCommunityBody"
  );

const saveAdminCommunityButton =
  document.querySelector(
    "#saveAdminCommunityButton"
  );

const cancelAdminCommunityEditButton =
  document.querySelector(
    "#cancelAdminCommunityEditButton"
  );

const adminCommunityMessage =
  document.querySelector(
    "#adminCommunityMessage"
  );

// 게시한 센터 소식 관리 요소
const adminCommunityPostList =
  document.querySelector(
    "#adminCommunityPostList"
  );

const adminCommunityListMessage =
  document.querySelector(
    "#adminCommunityListMessage"
  );

// 선택된 센터 소식 이미지 파일
let selectedAdminCommunityFiles = [];

// 미리보기에 사용한 임시 주소
let adminCommunityPreviewUrls = [];

// 관리 화면에 불러온 센터 소식
let loadedAdminCommunityPosts = [];
let editingAdminCommunityPostId = null;
let existingAdminCommunityImages = [];
let removedAdminCommunityImages = [];

// 관리자 센터 소식 목록 표시
function renderAdminCommunityPostList(
  posts
) {
  adminCommunityPostList.innerHTML = "";

  if (!posts || posts.length === 0) {
    adminCommunityListMessage.textContent =
      "아직 게시한 센터 소식이 없습니다.";

    return;
  }

  adminCommunityListMessage.textContent =
    "";

  posts.forEach(function (post) {
    const manageCard =
      document.createElement("article");

    manageCard.className =
      "admin-community-manage-card";

    const manageMain =
      document.createElement("div");

    manageMain.className =
      "admin-community-manage-main";

    const postImages =
      post.community_post_images || [];

    const firstImage =
      postImages[0];

    if (firstImage) {
      const thumbnail =
        document.createElement("img");

      thumbnail.className =
        "admin-community-manage-thumbnail";

      thumbnail.src =
        firstImage.signedUrl;

      thumbnail.alt =
        firstImage.alt_text ||
        `${post.title} 대표 이미지`;

      thumbnail.loading = "lazy";

      manageMain.append(thumbnail);
    }

    const manageInfo =
      document.createElement("div");

    manageInfo.className =
      "admin-community-manage-info";

    const manageTitle =
      document.createElement("h3");

    manageTitle.className =
      "admin-community-manage-title";

    manageTitle.textContent =
      post.title;

    const manageMeta =
      document.createElement("p");

    manageMeta.className =
      "admin-community-manage-meta";

    const dateText =
      new Intl.DateTimeFormat(
        "ko-KR",
        {
          year: "numeric",
          month: "long",
          day: "numeric"
        }
      ).format(
        new Date(
          post.published_at ||
          post.created_at
        )
      );

    manageMeta.textContent =
      `${dateText} · 사진 ${postImages.length}장`;

    manageInfo.append(
      manageTitle,
      manageMeta
    );

    manageMain.append(manageInfo);

    const actionArea =
      document.createElement("div");

    actionArea.className =
      "admin-community-manage-actions";

    const editButton =
      document.createElement("button");

    editButton.type = "button";
    editButton.className =
      "admin-community-edit-button";

    editButton.textContent = "수정";

    editButton.addEventListener(
      "click",
      function () {
        startAdminCommunityPostEdit(
          post
        );
      }
    );

    const deleteButton =
      document.createElement("button");

    deleteButton.type = "button";
    deleteButton.className =
      "admin-community-delete-button";

    deleteButton.textContent = "삭제";

    deleteButton.addEventListener(
      "click",
      function () {
        deleteAdminCommunityPost(
          post,
          deleteButton
        );
      }
    );

    actionArea.append(
      editButton,
      deleteButton
    );

    manageCard.append(
      manageMain,
      actionArea
    );

    adminCommunityPostList.append(
      manageCard
    );
  });
}


// 관리자용 센터 소식 불러오기
async function loadAdminCommunityPosts() {
  adminCommunityPostList.innerHTML = "";

  adminCommunityListMessage.textContent =
    "센터 소식을 불러오고 있습니다.";

  try {
    const {
      data: posts,
      error: postsError
    } = await supabaseClient
      .from("community_posts")
      .select(`
        id,
        title,
        body,
        published_at,
        created_at,
        community_post_images (
          id,
          storage_path,
          alt_text,
          sort_order
        )
      `)
      .eq("is_published", true)
      .order(
        "published_at",
        { ascending: false }
      );

    if (postsError) {
      throw postsError;
    }

    loadedAdminCommunityPosts =
      await Promise.all(
        (posts || []).map(
          async function (post) {
            const sortedImages = [
              ...(post.community_post_images || [])
            ].sort(
              function (first, second) {
                return (
                  first.sort_order -
                  second.sort_order
                );
              }
            );

            const imagesWithUrls =
              await Promise.all(
                sortedImages.map(
                  async function (image) {
                    const {
                      data: signedImageData,
                      error: signedImageError
                    } =
                      await supabaseClient.storage
                        .from("community-images")
                        .createSignedUrl(
                          image.storage_path,
                          3600
                        );

                    if (signedImageError) {
                      throw signedImageError;
                    }

                    return {
                      ...image,
                      signedUrl:
                        signedImageData.signedUrl
                    };
                  }
                )
              );

            return {
              ...post,
              community_post_images:
                imagesWithUrls
            };
          }
        )
      );

    renderAdminCommunityPostList(
      loadedAdminCommunityPosts
    );

  } catch (loadError) {
    console.error(
      "관리자 센터 소식 불러오기 실패:",
      loadError
    );

    loadedAdminCommunityPosts = [];

    adminCommunityListMessage.textContent =
      `센터 소식을 불러오지 못했습니다: ${loadError.message ||
      "알 수 없는 오류"
      }`;
  }
}

// 관리자 센터 소식 삭제
async function deleteAdminCommunityPost(
  post,
  deleteButton
) {
  const deleteConfirmed =
    window.confirm(
      `"${post.title}" 소식을 삭제할까요?\n\n삭제한 글과 사진은 복구할 수 없습니다.`
    );

  if (!deleteConfirmed) {
    return;
  }

  const imagePaths =
    (
      post.community_post_images || []
    )
      .map(function (image) {
        return image.storage_path;
      })
      .filter(Boolean);

  deleteButton.disabled = true;
  deleteButton.textContent = "삭제 중...";

  adminCommunityListMessage.textContent =
    "센터 소식을 삭제하고 있습니다.";

  try {
    /*
      회원 화면에서 게시물이 먼저 사라지도록
      DB 게시물과 연결 정보를 삭제
    */
    const {
      data: deletedPosts,
      error: postDeleteError
    } = await supabaseClient
      .from("community_posts")
      .delete()
      .eq("id", post.id)
      .select("id");

    if (postDeleteError) {
      throw postDeleteError;
    }

    if (
      !deletedPosts ||
      deletedPosts.length === 0
    ) {
      throw new Error(
        "삭제할 센터 소식을 찾을 수 없습니다."
      );
    }

    /*
      DB 삭제 후 Storage의 실제 사진 파일 정리
    */
    let imageCleanupError = null;

    if (imagePaths.length > 0) {
      const {
        error: storageDeleteError
      } = await supabaseClient.storage
        .from("community-images")
        .remove(imagePaths);

      imageCleanupError =
        storageDeleteError;
    }

    if (
      editingAdminCommunityPostId === post.id
    ) {
      resetAdminCommunityEditor();
    }

    await loadAdminCommunityPosts();

    if (imageCleanupError) {
      console.error(
        "삭제된 소식의 이미지 정리 실패:",
        imageCleanupError
      );

      adminCommunityListMessage.textContent =
        "소식은 삭제했지만 사진 파일 정리에 실패했습니다.";

      return;
    }

    adminCommunityListMessage.textContent =
      "센터 소식을 삭제했습니다.";

    setTimeout(function () {
      if (
        adminCommunityListMessage.textContent ===
        "센터 소식을 삭제했습니다."
      ) {
        adminCommunityListMessage.textContent =
          "";
      }
    }, 2500);

  } catch (deleteError) {
    console.error(
      "센터 소식 삭제 실패:",
      deleteError
    );

    adminCommunityListMessage.textContent =
      `삭제 실패: ${deleteError.message ||
      "알 수 없는 오류"
      }`;

    deleteButton.disabled = false;
    deleteButton.textContent = "삭제";
  }
}

// 미리보기 화면과 임시 주소 정리
function clearAdminCommunityImagePreview() {
  adminCommunityPreviewUrls.forEach(
    function (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  );

  adminCommunityPreviewUrls = [];
  adminCommunityImagePreview.innerHTML = "";
}


// 선택 이미지 전체 초기화
function resetAdminCommunityImages() {
  selectedAdminCommunityFiles = [];
  adminCommunityImages.value = "";

  clearAdminCommunityImagePreview();
}


// 현재 선택된 이미지 미리보기 표시
function renderAdminCommunityImagePreview() {
  clearAdminCommunityImagePreview();

  // 수정 중인 소식에 이미 저장되어 있던 사진
  existingAdminCommunityImages.forEach(function (image, index) {
    const previewItem = document.createElement("div");
    previewItem.className = "admin-community-preview-item";

    const previewImage = document.createElement("img");
    previewImage.src = image.signedUrl;
    previewImage.alt = `기존 소식 이미지 ${index + 1}`;

    const previewNumber = document.createElement("span");
    previewNumber.className = "admin-community-preview-number";
    previewNumber.textContent = String(index + 1);

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "admin-community-preview-remove";
    removeButton.textContent = "×";
    removeButton.setAttribute(
      "aria-label",
      `${index + 1}번 기존 이미지 삭제`
    );

    removeButton.addEventListener("click", function () {
      const [removedImage] =
        existingAdminCommunityImages.splice(index, 1);

      if (removedImage) {
        removedAdminCommunityImages.push(removedImage);
      }

      adminCommunityMessage.textContent = "";
      renderAdminCommunityImagePreview();
    });

    previewItem.append(
      previewImage,
      previewNumber,
      removeButton
    );

    adminCommunityImagePreview.append(previewItem);
  });

  // 이번에 새로 선택한 사진
  selectedAdminCommunityFiles.forEach(function (file, index) {
    const combinedIndex =
      existingAdminCommunityImages.length + index;

    const previewUrl = URL.createObjectURL(file);
    adminCommunityPreviewUrls.push(previewUrl);

    const previewItem = document.createElement("div");
    previewItem.className = "admin-community-preview-item";

    const previewImage = document.createElement("img");
    previewImage.src = previewUrl;
    previewImage.alt = `새 소식 이미지 ${combinedIndex + 1}`;

    const previewNumber = document.createElement("span");
    previewNumber.className = "admin-community-preview-number";
    previewNumber.textContent = String(combinedIndex + 1);

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "admin-community-preview-remove";
    removeButton.textContent = "×";
    removeButton.setAttribute(
      "aria-label",
      `${combinedIndex + 1}번 새 이미지 선택 취소`
    );

    removeButton.addEventListener("click", function () {
      selectedAdminCommunityFiles.splice(index, 1);
      adminCommunityMessage.textContent = "";
      renderAdminCommunityImagePreview();
    });

    previewItem.append(
      previewImage,
      previewNumber,
      removeButton
    );

    adminCommunityImagePreview.append(previewItem);
  });
}

// 센터 소식 작성 화면 초기화
function resetAdminCommunityEditor() {
  editingAdminCommunityPostId = null;
  existingAdminCommunityImages = [];
  removedAdminCommunityImages = [];

  adminCommunityTitle.value = "";
  adminCommunityBody.value = "";

  resetAdminCommunityImages();

  adminCommunityEditorTitle.textContent =
    "센터 소식 작성";

  saveAdminCommunityButton.textContent =
    "센터 소식 게시";

  cancelAdminCommunityEditButton.hidden = true;
  adminCommunityMessage.textContent = "";
}


// 기존 센터 소식 수정 시작
function startAdminCommunityPostEdit(post) {
  editingAdminCommunityPostId = post.id;

  existingAdminCommunityImages = [
    ...(post.community_post_images || [])
  ];

  removedAdminCommunityImages = [];
  selectedAdminCommunityFiles = [];

  adminCommunityImages.value = "";

  adminCommunityTitle.value =
    post.title || "";

  adminCommunityBody.value =
    post.body || "";

  adminCommunityEditorTitle.textContent =
    "센터 소식 수정";

  saveAdminCommunityButton.textContent =
    "수정 내용 저장";

  cancelAdminCommunityEditButton.hidden = false;

  adminCommunityMessage.textContent =
    "기존 내용을 수정한 뒤 저장해 주세요.";

  renderAdminCommunityImagePreview();

  document
    .querySelector("#adminCommunityEditor")
    .scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  adminCommunityTitle.focus();
}


// 수정 취소 버튼 연결
cancelAdminCommunityEditButton.addEventListener(
  "click",
  resetAdminCommunityEditor
);

// 센터 소식 이미지 추가 선택
adminCommunityImages.addEventListener(
  "change",
  function () {
    const newlySelectedFiles = Array.from(
      adminCommunityImages.files || []
    );

    /*
      같은 파일을 다시 선택해도 change가
      작동할 수 있도록 입력창만 초기화
    */
    adminCommunityImages.value = "";

    if (newlySelectedFiles.length === 0) {
      return;
    }

    const allowedImageTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    const hasInvalidFile =
      newlySelectedFiles.some(
        function (file) {
          return !allowedImageTypes.includes(
            file.type
          );
        }
      );

    if (hasInvalidFile) {
      adminCommunityMessage.textContent =
        "JPG, PNG, WEBP 이미지만 선택할 수 있습니다.";

      return;
    }

    // 이미 선택된 동일 파일은 제외
    const filesToAdd =
      newlySelectedFiles.filter(
        function (newFile) {
          return !selectedAdminCommunityFiles.some(
            function (selectedFile) {
              return (
                selectedFile.name ===
                newFile.name &&
                selectedFile.size ===
                newFile.size &&
                selectedFile.lastModified ===
                newFile.lastModified
              );
            }
          );
        }
      );

    if (
      existingAdminCommunityImages.length +
      selectedAdminCommunityFiles.length +
      filesToAdd.length >
      5
    ) {
      adminCommunityMessage.textContent =
        "이미지는 최대 5장까지 선택할 수 있습니다.";

      return;
    }

    selectedAdminCommunityFiles = [
      ...selectedAdminCommunityFiles,
      ...filesToAdd
    ];

    renderAdminCommunityImagePreview();

    if (
      filesToAdd.length <
      newlySelectedFiles.length
    ) {
      adminCommunityMessage.textContent =
        "이미 선택한 파일은 중복에서 제외했습니다.";
    } else {
      adminCommunityMessage.textContent = "";
    }
  }
);

// 센터 소식 이미지 용량 최적화
async function optimizeCommunityImage(
  originalFile
) {
  const maximumLength = 1600;
  const webpQuality = 0.85;

  const sourceUrl =
    URL.createObjectURL(originalFile);

  try {
    const sourceImage =
      await new Promise(
        function (resolve, reject) {
          const image =
            new Image();

          image.onload = function () {
            resolve(image);
          };

          image.onerror = function () {
            reject(
              new Error(
                "이미지 파일을 읽을 수 없습니다."
              )
            );
          };

          image.src = sourceUrl;
        }
      );

    const originalWidth =
      sourceImage.naturalWidth;

    const originalHeight =
      sourceImage.naturalHeight;

    if (
      !originalWidth ||
      !originalHeight
    ) {
      throw new Error(
        "이미지 크기를 확인할 수 없습니다."
      );
    }

    /*
      가로와 세로 중 긴 쪽이
      최대 1600px이 되도록 비율 유지
    */
    const resizeRatio = Math.min(
      1,
      maximumLength /
      Math.max(
        originalWidth,
        originalHeight
      )
    );

    const outputWidth = Math.max(
      1,
      Math.round(
        originalWidth * resizeRatio
      )
    );

    const outputHeight = Math.max(
      1,
      Math.round(
        originalHeight * resizeRatio
      )
    );

    const canvas =
      document.createElement("canvas");

    canvas.width = outputWidth;
    canvas.height = outputHeight;

    const canvasContext =
      canvas.getContext("2d");

    if (!canvasContext) {
      throw new Error(
        "이미지 최적화 기능을 사용할 수 없습니다."
      );
    }

    canvasContext.imageSmoothingEnabled =
      true;

    canvasContext.imageSmoothingQuality =
      "high";

    canvasContext.drawImage(
      sourceImage,
      0,
      0,
      outputWidth,
      outputHeight
    );

    const optimizedBlob =
      await new Promise(
        function (resolve) {
          canvas.toBlob(
            resolve,
            "image/webp",
            webpQuality
          );
        }
      );

    /*
      WebP 변환을 지원하지 않는 환경에서는
      원본 파일을 그대로 사용
    */
    if (!optimizedBlob) {
      return originalFile;
    }

    /*
      원본보다 결과 파일이 커졌다면
      더 작은 원본을 그대로 사용
    */
    if (
      optimizedBlob.size >=
      originalFile.size
    ) {
      return originalFile;
    }

    const originalName =
      originalFile.name.replace(
        /\.[^/.]+$/,
        ""
      ) || "community-image";

    const optimizedFile =
      new File(
        [optimizedBlob],
        `${originalName}.webp`,
        {
          type: "image/webp",
          lastModified: Date.now()
        }
      );

    console.log(
      "센터 소식 이미지 최적화:",
      {
        originalKB: Math.round(
          originalFile.size / 1024
        ),
        optimizedKB: Math.round(
          optimizedFile.size / 1024
        ),
        outputSize:
          `${outputWidth}×${outputHeight}`
      }
    );

    return optimizedFile;

  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

// 기존 센터 소식 수정 저장
async function updateAdminCommunityPost(
  title,
  body
) {
  const postId =
    editingAdminCommunityPostId;

  const uploadedImagePaths = [];

  const removedImageIds =
    removedAdminCommunityImages
      .map(function (image) {
        return image.id;
      })
      .filter(Boolean);

  const removedImagePaths =
    removedAdminCommunityImages
      .map(function (image) {
        return image.storage_path;
      })
      .filter(Boolean);

  saveAdminCommunityButton.disabled = true;
  saveAdminCommunityButton.textContent =
    "수정 저장 중...";

  adminCommunityMessage.textContent =
    "센터 소식을 수정하고 있습니다.";

  try {
    if (!postId) {
      throw new Error(
        "수정할 센터 소식을 확인할 수 없습니다."
      );
    }

    const newImageRows = [];

    // 새로 선택한 사진 업로드
    for (
      let index = 0;
      index <
      selectedAdminCommunityFiles.length;
      index += 1
    ) {
      const originalFile =
        selectedAdminCommunityFiles[index];

      adminCommunityMessage.textContent =
        `새 이미지 ${index + 1}/${selectedAdminCommunityFiles.length
        } 최적화 중...`;

      const file =
        await optimizeCommunityImage(
          originalFile
        );

      adminCommunityMessage.textContent =
        `새 이미지 ${index + 1}/${selectedAdminCommunityFiles.length
        } 업로드 중...`;

      const extensionByType = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp"
      };

      const fileExtension =
        extensionByType[file.type] || "jpg";

      const uniqueName =
        `${Date.now()}-${index}-` +
        `${Math.random()
          .toString(36)
          .slice(2)}.${fileExtension}`;

      const storagePath =
        `${postId}/${uniqueName}`;

      const {
        error: uploadError
      } = await supabaseClient.storage
        .from("community-images")
        .upload(
          storagePath,
          file,
          {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type
          }
        );

      if (uploadError) {
        throw uploadError;
      }

      uploadedImagePaths.push(
        storagePath
      );

      newImageRows.push({
        post_id: postId,
        storage_path: storagePath,
        alt_text:
          `${title} 이미지 ${existingAdminCommunityImages.length +
          index +
          1
          }`,
        sort_order:
          existingAdminCommunityImages.length +
          index
      });
    }

    /*
      사진 순번이 겹치지 않도록
      삭제할 기존 사진 정보를 먼저 제거
    */
    if (removedImageIds.length > 0) {
      const {
        error: imageDeleteError
      } = await supabaseClient
        .from("community_post_images")
        .delete()
        .eq("post_id", postId)
        .in("id", removedImageIds);

      if (imageDeleteError) {
        throw imageDeleteError;
      }
    }

    // 남아 있는 기존 사진 순서 정리
    for (
      let index = 0;
      index <
      existingAdminCommunityImages.length;
      index += 1
    ) {
      const image =
        existingAdminCommunityImages[index];

      const {
        error: imageUpdateError
      } = await supabaseClient
        .from("community_post_images")
        .update({
          sort_order: index,
          alt_text:
            `${title} 이미지 ${index + 1}`
        })
        .eq("id", image.id)
        .eq("post_id", postId);

      if (imageUpdateError) {
        throw imageUpdateError;
      }
    }

    /*
      기존 사진 순서를 정리한 다음
      새 사진 정보를 데이터베이스에 저장
    */
    if (newImageRows.length > 0) {
      const {
        error: imageInsertError
      } = await supabaseClient
        .from("community_post_images")
        .insert(newImageRows);

      if (imageInsertError) {
        throw imageInsertError;
      }
    }

    // 제목과 내용 수정
    const {
      data: updatedPosts,
      error: postUpdateError
    } = await supabaseClient
      .from("community_posts")
      .update({
        title: title,
        body: body,
        updated_at:
          new Date().toISOString()
      })
      .eq("id", postId)
      .select("id");

    if (postUpdateError) {
      throw postUpdateError;
    }

    if (
      !updatedPosts ||
      updatedPosts.length === 0
    ) {
      throw new Error(
        "수정할 센터 소식을 찾을 수 없습니다."
      );
    }

    let storageCleanupError = null;

    // 삭제한 기존 사진 파일 제거
    if (removedImagePaths.length > 0) {
      const {
        error: removeStorageError
      } = await supabaseClient.storage
        .from("community-images")
        .remove(removedImagePaths);

      storageCleanupError =
        removeStorageError;
    }

    resetAdminCommunityEditor();
    await loadAdminCommunityPosts();

    if (storageCleanupError) {
      console.error(
        "삭제한 소식 이미지 파일 정리 실패:",
        storageCleanupError
      );

      adminCommunityMessage.textContent =
        "소식은 수정했지만 일부 사진 파일 정리에 실패했습니다.";

      return;
    }

    adminCommunityMessage.textContent =
      "센터 소식을 수정했습니다.";

  } catch (updateError) {
    console.error(
      "센터 소식 수정 실패:",
      updateError
    );

    /*
      수정 도중 실패하면 이번에 새로 올린
      사진 정보와 파일만 정리
    */
    if (uploadedImagePaths.length > 0) {
      const {
        error: cleanupRowsError
      } = await supabaseClient
        .from("community_post_images")
        .delete()
        .eq("post_id", postId)
        .in(
          "storage_path",
          uploadedImagePaths
        );

      if (cleanupRowsError) {
        console.error(
          "새 이미지 정보 정리 실패:",
          cleanupRowsError
        );
      }

      const {
        error: cleanupFilesError
      } = await supabaseClient.storage
        .from("community-images")
        .remove(uploadedImagePaths);

      if (cleanupFilesError) {
        console.error(
          "새 이미지 파일 정리 실패:",
          cleanupFilesError
        );
      }
    }

    adminCommunityMessage.textContent =
      `수정 실패: ${updateError.message ||
      "알 수 없는 오류"
      }`;

  } finally {
    saveAdminCommunityButton.disabled =
      false;

    saveAdminCommunityButton.textContent =
      editingAdminCommunityPostId
        ? "수정 내용 저장"
        : "센터 소식 게시";
  }
}

// 센터 소식 게시
async function saveAdminCommunityPost() {
  const title =
    adminCommunityTitle.value.trim();

  const body =
    adminCommunityBody.value.trim();

  if (!title) {
    adminCommunityMessage.textContent =
      "소식 제목을 입력해 주세요.";

    adminCommunityTitle.focus();
    return;
  }

  if (!body) {
    adminCommunityMessage.textContent =
      "소식 내용을 입력해 주세요.";

    adminCommunityBody.focus();
    return;
  }

  const totalImageCount =
    existingAdminCommunityImages.length +
    selectedAdminCommunityFiles.length;

  if (totalImageCount === 0) {
    adminCommunityMessage.textContent =
      "소식 이미지를 1장 이상 선택해 주세요.";

    return;
  }

  if (totalImageCount > 5) {
    adminCommunityMessage.textContent =
      "이미지는 최대 5장까지 선택할 수 있습니다.";

    return;
  }

  /*
    수정 중이라면 새 게시물을 만들지 않고
    기존 게시물 수정 함수 실행
  */
  if (editingAdminCommunityPostId) {
    await updateAdminCommunityPost(
      title,
      body
    );

    return;
  }

  saveAdminCommunityButton.disabled = true;
  saveAdminCommunityButton.textContent =
    "게시 중...";

  adminCommunityMessage.textContent =
    "센터 소식을 저장하고 있습니다.";

  let createdPostId = null;
  const uploadedImagePaths = [];

  try {
    const {
      data: { user },
      error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error(
        "로그인 정보를 확인할 수 없습니다."
      );
    }

    /*
      이미지 저장이 모두 완료되기 전에는
      회원 화면에 게시물이 나타나지 않도록
      비공개 상태로 먼저 생성
    */
    const {
      data: createdPost,
      error: postInsertError
    } = await supabaseClient
      .from("community_posts")
      .insert({
        title: title,
        body: body,
        is_published: false,
        created_by: user.id
      })
      .select("id")
      .single();

    if (postInsertError) {
      throw postInsertError;
    }

    createdPostId = createdPost.id;

    const imageRows = [];

    /*
      선택한 순서대로 이미지를 Storage에
      하나씩 업로드
    */
    for (
      let index = 0;
      index <
      selectedAdminCommunityFiles.length;
      index += 1
    ) {
      const originalFile =
        selectedAdminCommunityFiles[index];

      adminCommunityMessage.textContent =
        `이미지 ${index + 1}/${selectedAdminCommunityFiles.length
        } 최적화 중...`;

      const file =
        await optimizeCommunityImage(
          originalFile
        );

      adminCommunityMessage.textContent =
        `이미지 ${index + 1}/${selectedAdminCommunityFiles.length
        } 업로드 중...`;

      const extensionByType = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp"
      };

      const fileExtension =
        extensionByType[file.type];

      const uniqueName =
        `${Date.now()}-${index}-` +
        `${Math.random()
          .toString(36)
          .slice(2)}.${fileExtension}`;

      const storagePath =
        `${createdPostId}/${uniqueName}`;

      const {
        error: uploadError
      } = await supabaseClient.storage
        .from("community-images")
        .upload(
          storagePath,
          file,
          {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type
          }
        );

      if (uploadError) {
        throw uploadError;
      }

      uploadedImagePaths.push(
        storagePath
      );

      imageRows.push({
        post_id: createdPostId,
        storage_path: storagePath,
        alt_text:
          `${title} 이미지 ${index + 1}`,
        sort_order: index
      });
    }

    // 업로드된 이미지 정보를 DB에 저장
    const {
      error: imageInsertError
    } = await supabaseClient
      .from("community_post_images")
      .insert(imageRows);

    if (imageInsertError) {
      throw imageInsertError;
    }

    /*
      본문과 이미지가 모두 저장된 후
      회원에게 공개
    */
    const {
      error: publishError
    } = await supabaseClient
      .from("community_posts")
      .update({
        is_published: true,
        published_at:
          new Date().toISOString(),
        updated_at:
          new Date().toISOString()
      })
      .eq("id", createdPostId);

    if (publishError) {
      throw publishError;
    }

    adminCommunityTitle.value = "";
    adminCommunityBody.value = "";

    resetAdminCommunityImages();

    await loadAdminCommunityPosts();

    adminCommunityMessage.textContent =
      "센터 소식을 게시했습니다.";

  } catch (saveError) {
    console.error(
      "센터 소식 게시 실패:",
      saveError
    );

    /*
      저장 도중 실패했다면 이미 업로드된
      이미지와 미완성 게시물을 정리
    */
    if (uploadedImagePaths.length > 0) {
      const {
        error: cleanupImageError
      } = await supabaseClient.storage
        .from("community-images")
        .remove(uploadedImagePaths);

      if (cleanupImageError) {
        console.error(
          "소식 이미지 정리 실패:",
          cleanupImageError
        );
      }
    }

    if (createdPostId !== null) {
      const {
        error: cleanupPostError
      } = await supabaseClient
        .from("community_posts")
        .delete()
        .eq("id", createdPostId);

      if (cleanupPostError) {
        console.error(
          "미완성 소식 정리 실패:",
          cleanupPostError
        );
      }
    }

    adminCommunityMessage.textContent =
      `게시 실패: ${saveError.message ||
      "알 수 없는 오류"
      }`;

  } finally {
    saveAdminCommunityButton.disabled =
      false;

    saveAdminCommunityButton.textContent =
      "센터 소식 게시";
  }
}


// 센터 소식 게시 버튼 연결
saveAdminCommunityButton.addEventListener(
  "click",
  saveAdminCommunityPost
);

function appendTextWithLinks(container, text) {
  const urlPattern = /https?:\/\/[^\s]+/g;
  let lastIndex = 0;

  for (const match of text.matchAll(urlPattern)) {
    const url = match[0];

    container.append(
      document.createTextNode(text.slice(lastIndex, match.index))
    );

    const link = document.createElement("a");
    link.href = url;
    link.textContent = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    container.append(link);

    lastIndex = match.index + url.length;
  }

  container.append(document.createTextNode(text.slice(lastIndex)));
}

function renderRoutineDescription(description) {
  routineDescription.replaceChildren();
  routineDescription.classList.remove("is-expanded");

  if (!description || !description.trim()) {
    routineDescription.hidden = true;
    toggleRoutineDescriptionButton.hidden = true;
    return;
  }

  description.trim().split(/\n+/).forEach((line) => {
    const paragraph = document.createElement("p");

    appendTextWithLinks(paragraph, line);

    routineDescription.append(paragraph);
  });

  routineDescription.hidden = false;
  toggleRoutineDescriptionButton.hidden = false;
  toggleRoutineDescriptionButton.textContent = "설명 더 보기";
  toggleRoutineDescriptionButton.setAttribute("aria-expanded", "false");
}
// 회원에게 배정된 최신 루틴 불러오기
async function loadMemberRoutine(userId) {
  const routineElement =
    routineImage.closest(".routine-image");

  routineElement.hidden = true;
  routineDescription.hidden = true;

  const { data, error } = await supabaseClient
    .from("member_routines")
    .select("routine_name, routine_image_url, routine_image_path, routine_description")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("assigned_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("루틴 불러오기 실패:", error);
    assignedRoutineName.textContent = "루틴을 불러오지 못했습니다.";
    return;
  }

  if (!data) {
    assignedRoutineName.textContent = "배정된 루틴이 없습니다.";
    return;
  }

  let imageUrl = data.routine_image_url;

  if (data.routine_image_path) {
    const { data: signedUrlData, error: signedUrlError } =
      await supabaseClient.storage
        .from("routine-images")
        .createSignedUrl(data.routine_image_path, 60 * 60);

    if (signedUrlError) {
      console.error("루틴 이미지 주소 생성 실패:", signedUrlError);
      assignedRoutineName.textContent = "루틴 이미지를 불러오지 못했습니다.";
      return;
    }

    imageUrl = signedUrlData.signedUrl;
  }

  if (!imageUrl) {
    assignedRoutineName.textContent = "루틴 이미지가 없습니다.";
    return;
  }

  assignedRoutineName.textContent = data.routine_name;
  renderRoutineDescription(data.routine_description);
  routineImage.src = imageUrl;
  routineImage.alt = data.routine_name;


  routineElement.hidden = false;
}

// 일반 회원 화면 표시
async function showWorkoutApp(userId) {
  loginScreen.hidden = true;
  adminScreen.hidden = true;
  appScreen.hidden = false;

  showMemberTab("routine");
  resetWorkoutCalendar();

  await Promise.all([
    loadMemberRoutine(userId),
    loadWorkoutRecords(userId),
    loadCommunityPosts()
  ]);
}

// 관리자용 회원 목록 불러오기
async function loadAdminMembers() {
  const [
    { data: members, error: membersError },
    { data: routines, error: routinesError }
  ] = await Promise.all([
    supabaseClient
      .from("profiles")
      .select("id, display_name, email, phone_last4, created_at")
      .eq("role", "member")
      .order("created_at", { ascending: false }),

    supabaseClient
      .from("member_routines")
      .select(
        "user_id, routine_name, routine_image_path, is_active, assigned_at"
      )
      .order("assigned_at", { ascending: false })
  ]);

  if (membersError || routinesError) {
    console.error(
      "관리자 회원 정보 불러오기 실패:",
      membersError || routinesError
    );

    adminMemberSelect.innerHTML =
      '<option value="">회원 목록을 불러오지 못했습니다.</option>';

    return;
  }

  if (!members || members.length === 0) {
    adminMemberSelect.innerHTML =
      '<option value="">등록된 회원이 없습니다.</option>';

    return;
  }

  const routineSummaryByUser = new Map();

  (routines || []).forEach((routine) => {
    const summary = routineSummaryByUser.get(routine.user_id) || {
      assignmentCount: 0,
      currentRoutineName: "",
      currentRoutineImagePath: ""
    };

    summary.assignmentCount += 1;

    if (routine.is_active && !summary.currentRoutineName) {
      summary.currentRoutineName = routine.routine_name;
      summary.currentRoutineImagePath =
        routine.routine_image_path || "";
    }

    routineSummaryByUser.set(routine.user_id, summary);
  });

  adminMemberSelect.innerHTML =
    '<option value="">루틴을 관리할 회원을 선택하세요.</option>';

  members.forEach((member) => {
    const option = document.createElement("option");
    const memberName = member.display_name || "이름 없음";
    const phoneText = member.phone_last4
      ? ` · ${member.phone_last4}`
      : "";

    const summary = routineSummaryByUser.get(member.id) || {
      assignmentCount: 0,
      currentRoutineName: "",
      currentRoutineImagePath: ""
    };

    const routineStatus = summary.currentRoutineName
      ? "루틴 있음"
      : "루틴 없음";

    option.value = member.id;
    option.dataset.memberName = memberName;
    option.dataset.email = member.email || "";
    option.dataset.assignmentCount = String(summary.assignmentCount);
    option.dataset.currentRoutineName = summary.currentRoutineName;
    option.dataset.currentRoutineImagePath =
      summary.currentRoutineImagePath;
    option.textContent =
      `${memberName}${phoneText} · ` +
      `${summary.assignmentCount}회 배정 · ${routineStatus}`;

    adminMemberSelect.append(option);
  });

  adminMemberOptionCache = Array.from(
    adminMemberSelect.options
  )
    .slice(1)
    .map((option) => option.cloneNode(true));
}
// 관리자 회원 검색
adminMemberSearch.addEventListener("input", function () {
  const searchText =
    adminMemberSearch.value.trim().toLowerCase();

  const matchingOptions = adminMemberOptionCache.filter(
    (option) => {
      const optionText =
        option.textContent.toLowerCase();

      const email =
        (option.dataset.email || "").toLowerCase();

      return `${optionText} ${email}`.includes(searchText);
    }
  );

  adminMemberSelect.innerHTML =
    '<option value="">루틴을 관리할 회원을 선택하세요.</option>';

  if (matchingOptions.length === 0) {
    const noResultOption =
      document.createElement("option");

    noResultOption.value = "";
    noResultOption.textContent =
      "일치하는 회원이 없습니다.";
    noResultOption.disabled = true;

    adminMemberSelect.append(noResultOption);
  } else {
    matchingOptions.forEach((option) => {
      adminMemberSelect.append(
        option.cloneNode(true)
      );
    });
  }

  adminMemberSelect.value = "";

  adminMemberSelect.dispatchEvent(
    new Event("change")
  );
});
// 관리자 화면 표시
async function showAdminApp() {
  loginScreen.hidden = true;
  appScreen.hidden = true;
  adminScreen.hidden = false;

  adminRoutineEditor.hidden = true;
  adminMemberInfo.textContent = "루틴을 관리할 회원을 선택해 주세요.";
  adminMemberSearch.value = "";

  await Promise.all([
    loadAdminMembers(),
    loadAdminCommunityPosts()
  ]);
}

// 현재 로그인한 계정의 역할에 따라 화면 선택
async function showScreenForCurrentUser() {
  const {
    data: { user },
    error: userError
  } = await supabaseClient.auth.getUser();

  if (userError || !user) {
    loginMessage.textContent = "로그인 정보를 확인하지 못했습니다.";
    return;
  }

  const { data: profile, error: profileError } = await supabaseClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    console.error("회원 역할 확인 실패:", profileError);

    loginMessage.textContent = profileError
      ? `회원 정보 오류: ${profileError.message}`
      : "회원 정보 오류: 프로필이 없습니다.";

    return;
  }

  if (profile.role === "admin") {
    await showAdminApp();
    return;
  }

  await showWorkoutApp(user.id);
}

// 관리자 화면에서 회원을 선택했을 때
adminMemberSelect.addEventListener("change", async function () {
  const selectedOption =
    adminMemberSelect.options[adminMemberSelect.selectedIndex];

  // 다른 회원의 입력 내용이 남지 않도록 초기화
  adminRoutineName.value = "";
  adminRoutineImage.value = "";
  adminRoutineDescription.value = "";
  adminRoutinePreview.hidden = true;
  adminRoutinePreview.removeAttribute("src");
  adminSaveMessage.textContent = "";

  if (!adminMemberSelect.value) {
    adminRoutineEditor.hidden = true;
    adminMemberInfo.textContent =
      "루틴을 관리할 회원을 선택해 주세요.";
    return;
  }

  adminRoutineEditor.hidden = false;

  const memberName =
    selectedOption.dataset.memberName || "이름 없음";

  const email = selectedOption.dataset.email || "";
  const emailText = email ? ` (${email})` : "";

  const assignmentCount =
    selectedOption.dataset.assignmentCount || "0";

  const currentRoutineName =
    selectedOption.dataset.currentRoutineName || "";

  adminMemberInfo.textContent = currentRoutineName
    ? `${memberName}${emailText} · 총 ${assignmentCount}회 배정 · 현재 루틴: ${currentRoutineName}`
    : `${memberName}${emailText} · 총 ${assignmentCount}회 배정 · 현재 루틴 없음`;
  const currentRoutineImagePath =
    selectedOption.dataset.currentRoutineImagePath || "";

  if (currentRoutineImagePath) {
    const {
      data: signedImageData,
      error: signedImageError
    } = await supabaseClient.storage
      .from("routine-images")
      .createSignedUrl(currentRoutineImagePath, 3600);

    // 이미지를 불러오는 동안 다른 회원을 선택한 경우 중단
    if (adminMemberSelect.value !== selectedOption.value) {
      return;
    }

    if (signedImageError) {
      console.error(
        "현재 루틴 이미지 불러오기 실패:",
        signedImageError
      );
      return;
    }

    adminRoutinePreview.src = signedImageData.signedUrl;
    adminRoutinePreview.hidden = false;
  }
});
adminRoutineImage.addEventListener("change", function () {
  const selectedFile = adminRoutineImage.files[0];

  if (!selectedFile) {
    adminRoutinePreview.hidden = true;
    return;
  }

  adminRoutinePreview.src = URL.createObjectURL(selectedFile);
  adminRoutinePreview.hidden = false;
});

saveAdminRoutineButton.addEventListener("click", async function () {
  const userId = adminMemberSelect.value;
  const routineName = adminRoutineName.value.trim();
  const description = adminRoutineDescription.value.trim();
  const selectedFile = adminRoutineImage.files[0];

  if (!userId) {
    adminSaveMessage.textContent = "먼저 회원을 선택해 주세요.";
    return;
  }

  if (!routineName) {
    adminSaveMessage.textContent = "루틴 이름을 입력해 주세요.";
    return;
  }

  if (!selectedFile) {
    adminSaveMessage.textContent = "루틴 이미지를 선택해 주세요.";
    return;
  }

  if (!selectedFile.type.startsWith("image/")) {
    adminSaveMessage.textContent = "이미지 파일만 선택할 수 있습니다.";
    return;
  }

  if (selectedFile.size > 10 * 1024 * 1024) {
    adminSaveMessage.textContent = "이미지 파일은 10MB 이하만 올릴 수 있습니다.";
    return;
  }

  saveAdminRoutineButton.disabled = true;

  try {
    adminSaveMessage.textContent =
      "루틴 이미지를 저장 중입니다...";

    const safeFileName = selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const imagePath = `${userId}/${Date.now()}-${safeFileName}`;

    const { error: uploadError } = await supabaseClient.storage
      .from("routine-images")
      .upload(imagePath, selectedFile, {
        cacheControl: "3600",
        upsert: false
      });

    if (uploadError) {
      console.error("이미지 업로드 실패:", uploadError);
      adminSaveMessage.textContent = "이미지를 저장하지 못했습니다.";
      saveAdminRoutineButton.disabled = false;
      return;
    }

    const { data: newRoutine, error: insertError } = await supabaseClient
      .from("member_routines")
      .insert({
        user_id: userId,
        routine_name: routineName,
        routine_image_url: "",
        routine_image_path: imagePath,
        routine_description: description,
        is_active: true
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("루틴 정보 저장 실패:", insertError);

      // 데이터 저장에 실패했으므로 방금 업로드한 이미지를 삭제
      const { error: cleanupError } = await supabaseClient.storage
        .from("routine-images")
        .remove([imagePath]);

      if (cleanupError) {
        console.error(
          "저장 실패 이미지 정리 실패:",
          cleanupError
        );
      }

      adminSaveMessage.textContent =
        "루틴 정보를 저장하지 못했습니다.";

      saveAdminRoutineButton.disabled = false;
      return;
    }



    adminRoutineImage.value = "";
    adminRoutineDescription.value = "";
    adminMemberSearch.value = "";

    // 저장된 최신 정보를 다시 불러오기
    await loadAdminMembers();

    // 방금 루틴을 저장한 회원을 다시 선택
    adminMemberSelect.value = userId;

    adminMemberSelect.dispatchEvent(
      new Event("change")
    );

    adminSaveMessage.textContent =
      "저장했습니다. 최신 루틴 정보로 갱신되었습니다.";

  } catch (unexpectedError) {
    console.error(
      "루틴 저장 중 예상하지 못한 오류:",
      unexpectedError
    );

    adminSaveMessage.textContent =
      "작업 중 오류가 발생했습니다. " +
      "화면을 새로고침하여 저장 결과를 확인해 주세요.";

  } finally {
    saveAdminRoutineButton.disabled = false;
  }
});
// 로그인 버튼 기능
loginForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  loginMessage.textContent = "로그인 중...";
  loginButton.disabled = true;

  try {
    const { error } =
      await supabaseClient.auth.signInWithPassword({
        email: loginEmail.value.trim(),
        password: loginPassword.value
      });

    if (error) {
      loginMessage.textContent =
        "이메일 또는 비밀번호를 확인해 주세요.";
      return;
    }

    loginMessage.textContent = "";
    loginForm.reset();

    await showScreenForCurrentUser();

  } catch (unexpectedError) {
    console.error(
      "로그인 중 예상하지 못한 오류:",
      unexpectedError
    );

    loginMessage.textContent =
      "네트워크 연결을 확인하고 다시 시도해 주세요.";

  } finally {
    loginButton.disabled = false;
  }
});

// 이미 로그인한 상태인지 확인
async function initializeLogin() {
  try {
    const {
      data: { session },
      error: sessionError
    } = await supabaseClient.auth.getSession();

    if (sessionError) {
      console.error(
        "로그인 상태 확인 실패:",
        sessionError
      );

      loginMessage.textContent =
        "로그인 상태를 확인하지 못했습니다. " +
        "잠시 후 다시 시도해 주세요.";

      return;
    }

    if (session) {
      await showScreenForCurrentUser();
    }

  } catch (unexpectedError) {
    console.error(
      "로그인 상태 확인 중 예상하지 못한 오류:",
      unexpectedError
    );

    loginMessage.textContent =
      "네트워크 연결을 확인해 주세요.";
  }
}

// 로그아웃 공통 기능
async function handleLogout() {
  logoutButton.disabled = true;
  adminLogoutButton.disabled = true;

  try {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      alert("로그아웃하지 못했습니다. 다시 시도해 주세요.");
      return;
    }

    // 회원·관리자 화면을 숨기고 로그인 화면 표시
    appScreen.hidden = true;
    adminScreen.hidden = true;
    loginScreen.hidden = false;

    // 회원가입 화면이 열려 있었다면 기본 로그인 화면으로 복구
    signupForm.hidden = true;
    loginForm.hidden = false;
    showSignupButton.hidden = false;

    // 입력값과 안내 메시지 초기화
    loginForm.reset();
    signupForm.reset();
    loginMessage.textContent = "";
    signupMessage.textContent = "";

    // 버튼 상태 초기화
    loginButton.disabled = false;
    signupButton.disabled = false;

    // 관리자 화면 상태 초기화
    adminMemberSearch.value = "";
    adminMemberSelect.innerHTML =
      '<option value="">루틴을 관리할 회원을 선택하세요.</option>';

    adminMemberOptionCache = [];
    adminRoutineEditor.hidden = true;

    adminMemberInfo.textContent =
      "루틴을 관리할 회원을 선택해 주세요.";

    adminRoutineName.value = "";
    adminRoutineImage.value = "";
    adminRoutineDescription.value = "";

    adminRoutinePreview.hidden = true;
    adminRoutinePreview.removeAttribute("src");

    adminSaveMessage.textContent = "";
    saveAdminRoutineButton.disabled = false;

    // 비밀번호 입력창과 눈 버튼 초기화
    document
      .querySelectorAll("[data-password-toggle]")
      .forEach((button) => {
        const passwordInput = document.querySelector(
          `#${button.dataset.passwordToggle}`
        );

        if (passwordInput) {
          passwordInput.type = "password";
        }

        button.textContent = "👁";
        button.setAttribute("aria-label", "비밀번호 보기");
        button.setAttribute("aria-pressed", "false");
      });

  } catch (unexpectedError) {
    console.error(
      "로그아웃 중 예상하지 못한 오류:",
      unexpectedError
    );

    alert("네트워크 연결을 확인하고 다시 시도해 주세요.");

  } finally {
    logoutButton.disabled = false;
    adminLogoutButton.disabled = false;
  }
}

logoutButton.addEventListener("click", handleLogout);
adminLogoutButton.addEventListener("click", handleLogout);
toggleRoutineDescriptionButton.addEventListener("click", function () {
  const isExpanded = routineDescription.classList.toggle("is-expanded");

  toggleRoutineDescriptionButton.textContent = isExpanded
    ? "설명 접기"
    : "설명 더 보기";

  toggleRoutineDescriptionButton.setAttribute(
    "aria-expanded",
    String(isExpanded)
  );
});
function showSignupForm() {
  loginForm.hidden = true;
  showSignupButton.hidden = true;
  signupForm.hidden = false;

  loginMessage.textContent = "";
  signupMessage.textContent = "";
  signupForm.reset();
  signupEmail.focus();
}

function showLoginForm() {
  signupForm.hidden = true;
  loginForm.hidden = false;
  showSignupButton.hidden = false;

  signupMessage.textContent = "";
  signupForm.reset();
}

showSignupButton.addEventListener("click", showSignupForm);

hideSignupButton.addEventListener("click", showLoginForm);

signupForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const name = signupName.value.trim();
  const phoneLast4 = signupPhoneLast4.value.trim();

  if (!name) {
    signupMessage.textContent = "이름을 입력해 주세요.";
    signupName.focus();
    return;
  }

  if (!/^\d{4}$/.test(phoneLast4)) {
    signupMessage.textContent =
      "전화번호 뒷 4자리를 숫자로 입력해 주세요.";
    signupPhoneLast4.focus();
    return;
  }

  if (signupPassword.value !== signupPasswordConfirm.value) {
    signupMessage.textContent = "비밀번호가 서로 다릅니다.";
    return;
  }

  signupMessage.textContent = "회원가입 중...";
  signupButton.disabled = true;

  try {
    const { data, error } =
      await supabaseClient.auth.signUp({
        email: signupEmail.value.trim(),
        password: signupPassword.value,
        options: {
          data: {
            display_name: name,
            phone_last4: phoneLast4
          }
        }
      });

    if (error) {
      signupMessage.textContent =
        error.message === "User already registered"
          ? "이미 가입된 이메일입니다."
          : "회원가입하지 못했습니다. 다시 시도해 주세요.";

      return;
    }

    if (!data.session) {
      signupMessage.textContent =
        "회원가입은 완료됐습니다. " +
        "이메일 인증 설정을 다시 확인해 주세요.";

      return;
    }

    signupForm.reset();

    await initializeLogin();

  } catch (unexpectedError) {
    console.error(
      "회원가입 중 예상하지 못한 오류:",
      unexpectedError
    );

    signupMessage.textContent =
      "네트워크 연결을 확인하고 다시 시도해 주세요.";

  } finally {
    signupButton.disabled = false;
  }
});
document.querySelectorAll("[data-password-toggle]").forEach((button) => {
  button.addEventListener("click", function () {
    const passwordInput = document.querySelector(
      `#${button.dataset.passwordToggle}`
    );

    const isHidden = passwordInput.type === "password";

    passwordInput.type = isHidden ? "text" : "password";
    button.textContent = isHidden ? "🙈" : "👁";
    button.setAttribute(
      "aria-label",
      isHidden ? "비밀번호 숨기기" : "비밀번호 보기"
    );
    button.setAttribute("aria-pressed", String(isHidden));
  });
});
initializeLogin();