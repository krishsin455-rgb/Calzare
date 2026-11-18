
import { useEffect, useState } from "react";
import { api } from "../services/api";

const homepageDefaults = {
  heroTag: "⭐ PREMIUM FOOTWEAR",
  heroLine1: "Walk Your",
  heroLine2: "Own Way.",
  heroHighlight: "",
  heroDescription: "Premium footwear for every step of your journey.",
  heroButtonText: "EXPLORE COLLECTION",
  heroButtonLink: "/shop",
  heroImage: "",
  featuredTitle: "Featured Collection",
  featuredDescription: "Discover footwear made for every occasion.",
  everydayEyebrow: "MADE FOR EVERY DAY",
  everydayLine1: "Comfort in",
  everydayLine2: "every step.",
  everydayDescription: "Discover your everyday essentials.",
  everydayButtonText: "SHOP NOW",
  everydayButtonLink: "/shop",
  menImage: "",
  womenImage: "",
  menLabel: "MEN",
  womenLabel: "WOMEN",
  editorialImage: "",
  editorialEyebrow: "THE CALZARE WAY",
  editorialLine1: "Designed for",
  editorialLine2: "your journey.",
  editorialButtonText: "OUR STORY",
  editorialButtonLink: "/story",
  trustItems: [
    { title: "Premium Quality", description: "Made with care", icon: "✦" },
    { title: "Secure Payments", description: "Safe checkout", icon: "✓" },
    { title: "Easy Returns", description: "Simple support", icon: "↺" },
  ],
};

const storyDefaults = {
  eyebrow: "A NOTE FROM CALZARE",
  headingLine1: "Style that feels",
  headingLine2: "like you.",
  description:
    "We believe the best footwear earns its place in your everyday life.",
  paragraphs: [
    "Calzare is built around thoughtful design, versatile silhouettes and the small details that make getting dressed feel effortless.",
    "We believe great footwear should bring together comfort, quality and timeless style.",
  ],
  image: "",
  video: "",
  buttonText: "EXPLORE COLLECTION",
  buttonLink: "/shop",
};

const homepageFields = [
  ["heroTag", "Hero small heading"],
  ["heroLine1", "Hero heading line 1"],
  ["heroLine2", "Hero heading line 2"],
  ["heroHighlight", "Hero highlighted text"],
  ["heroDescription", "Hero description"],
  ["heroButtonText", "Hero button text"],
  ["heroButtonLink", "Hero button link"],
  ["heroImage", "Hero image URL"],
  ["featuredTitle", "Featured section heading"],
  ["featuredDescription", "Featured section description"],
  ["everydayEyebrow", "Everyday banner small heading"],
  ["everydayLine1", "Everyday banner line 1"],
  ["everydayLine2", "Everyday banner line 2"],
  ["everydayDescription", "Everyday banner description"],
  ["everydayButtonText", "Everyday button text"],
  ["everydayButtonLink", "Everyday button link"],
  ["menImage", "Men category image URL"],
  ["womenImage", "Women category image URL"],
  ["menLabel", "Men category label"],
  ["womenLabel", "Women category label"],
  ["editorialImage", "Editorial image URL"],
  ["editorialEyebrow", "Editorial small heading"],
  ["editorialLine1", "Editorial heading line 1"],
  ["editorialLine2", "Editorial heading line 2"],
  ["editorialButtonText", "Editorial button text"],
  ["editorialButtonLink", "Editorial button link"],
];

const storyFields = [
  ["eyebrow", "Small heading"],
  ["headingLine1", "Main heading line 1"],
  ["headingLine2", "Main heading line 2"],
  ["description", "Main description"],
  ["image", "Story image URL"],
  ["buttonText", "Button text"],
  ["buttonLink", "Button link"],
];

const imageFields = [
  "heroImage",
  "menImage",
  "womenImage",
  "editorialImage",
];

const imageAccept = "image/jpeg,image/png,image/webp,image/avif";

export default function ContentEditor({ section = "homepage" }) {
  const defaults =
    section === "homepage" ? homepageDefaults : storyDefaults;

  const [form, setForm] = useState(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setMessage("");

      try {
        const data = await api("/content");

        if (active) {
          const saved =
            section === "homepage" ? data.homepage : data.story;

          setForm({ ...defaults, ...(saved || {}) });
        }
      } catch (error) {
        if (active) {
          setMessage(error.message || "Could not load content.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [section]);

  const update = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const uploadContentImage = async (file, key) => {
    if (!file) return;

    if (!imageAccept.split(",").includes(file.type)) {
      setMessage("Please select a JPG, PNG, WEBP or AVIF image.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage("Image must be smaller than 10 MB.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    setUploadingImage(true);
    setMessage("Uploading image...");

    try {
      const data = await api("/content/upload-image", {
        method: "POST",
        body: formData,
      });

      update(key, data.image);
      setMessage("Image uploaded! Click Save Changes to publish it.");
    } catch (error) {
      setMessage(error.message || "Image upload failed.");
    } finally {
      setUploadingImage(false);
    }
  };

  const uploadStoryVideo = async (file) => {
    if (!file) return;

    if (file.type !== "video/mp4") {
      setMessage("Please select an MP4 video.");
      return;
    }

    const formData = new FormData();
    formData.append("video", file);

    setUploadingVideo(true);
    setMessage("Uploading video...");

    try {
      const data = await api("/content/upload-story-video", {
        method: "POST",
        body: formData,
      });

      update("video", data.video);
      setMessage("Story video uploaded! Click Save Changes to publish it.");
    } catch (error) {
      setMessage(error.message || "Video upload failed.");
    } finally {
      setUploadingVideo(false);
    }
  };

  const save = async () => {
    setSaving(true);
    setMessage("");

    try {
      await api("/content", {
        method: "PUT",
        body: JSON.stringify({ [section]: form }),
      });

      setMessage("Content saved successfully!");
    } catch (error) {
      setMessage(error.message || "Could not save content.");
    } finally {
      setSaving(false);
    }
  };

  const renderImageUpload = (key, label) => (
    <div style={{ marginBottom: "20px" }}>
      <label className="cal-content-field">
        <span>Upload {label}</span>

        <input
          type="file"
          accept={imageAccept}
          disabled={uploadingImage}
          onChange={(e) => {
            uploadContentImage(e.target.files?.[0], key);
            e.target.value = "";
          }}
        />
      </label>

      {form[key] && (
        <img
          src={form[key]}
          alt={`${label} preview`}
          style={{
            width: "100%",
            maxWidth: "500px",
            height: "220px",
            objectFit: "cover",
            display: "block",
            marginTop: "10px",
            marginBottom: "20px",
            borderRadius: "8px",
          }}
        />
      )}
    </div>
  );

  if (loading) return <p>Loading content...</p>;

  return (
    <div className="cal-content-editor">
      <div className="cal-section-head">
        <div>
          <h2>
            {section === "homepage"
              ? "Homepage Content"
              : "Our Story Content"}
          </h2>
          <p>Edit your website content from this panel.</p>
        </div>

        <button onClick={save} disabled={saving || uploadingImage || uploadingVideo}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {message && <p role="status">{message}</p>}

      {section === "homepage" ? (
        <>
          {homepageFields.map(([key, label]) => (
  <div key={key}>
    {key === "heroImage" ? (
      renderImageUpload(key, label)
    ) : (
      <label className="cal-content-field">
        <span>{label}</span>

        {key.toLowerCase().includes("description") ? (
          <textarea
            rows={3}
            value={form[key] || ""}
            onChange={(e) => update(key, e.target.value)}
          />
        ) : (
          <input
            value={form[key] || ""}
            onChange={(e) => update(key, e.target.value)}
          />
        )}
      </label>
    )}
  </div>
))}

          <h3>Trust Items</h3>

          {(form.trustItems || []).map((item, index) => (
            <div className="cal-content-field" key={index}>
              <label>
                Item {index + 1} title
                <input
                  value={item.title || ""}
                  onChange={(e) => {
                    const items = [...form.trustItems];
                    items[index] = {
                      ...item,
                      title: e.target.value,
                    };
                    update("trustItems", items);
                  }}
                />
              </label>

              <label>
                Description
                <input
                  value={item.description || ""}
                  onChange={(e) => {
                    const items = [...form.trustItems];
                    items[index] = {
                      ...item,
                      description: e.target.value,
                    };
                    update("trustItems", items);
                  }}
                />
              </label>

              <label>
                Icon
                <input
                  value={item.icon || ""}
                  onChange={(e) => {
                    const items = [...form.trustItems];
                    items[index] = {
                      ...item,
                      icon: e.target.value,
                    };
                    update("trustItems", items);
                  }}
                />
              </label>
            </div>
          ))}
        </>
      ) : (
        <>
          {storyFields.map(([key, label]) => (
            <div key={key}>
              <label className="cal-content-field">
                <span>{label}</span>

                {key === "description" ? (
                  <textarea
                    rows={4}
                    value={form[key] || ""}
                    onChange={(e) => update(key, e.target.value)}
                  />
                ) : (
                  <input
                    value={form[key] || ""}
                    onChange={(e) => update(key, e.target.value)}
                  />
                )}
              </label>

              {key === "image" &&
                renderImageUpload("image", "Our Story image")}
            </div>
          ))}

          <label className="cal-content-field">
            <span>Upload Our Story Video (MP4)</span>

            <input
              type="file"
              accept="video/mp4"
              disabled={uploadingVideo}
              onChange={(e) => {
                uploadStoryVideo(e.target.files?.[0]);
                e.target.value = "";
              }}
            />

            {uploadingVideo && <p>Uploading video...</p>}

            {form.video && (
              <div>
                <p>Video preview:</p>
                <video
                  src={form.video}
                  controls
                  playsInline
                  style={{
                    width: "100%",
                    maxWidth: "500px",
                  }}
                />

                <button
                  type="button"
                  onClick={() => update("video", "")}
                >
                  Remove Video
                </button>
              </div>
            )}
          </label>

          <h3>Our Story Paragraphs</h3>

          {(form.paragraphs || []).map((paragraph, index) => (
            <label className="cal-content-field" key={index}>
              <span>Paragraph {index + 1}</span>
              <textarea
                rows={4}
                value={paragraph}
                onChange={(e) => {
                  const paragraphs = [...form.paragraphs];
                  paragraphs[index] = e.target.value;
                  update("paragraphs", paragraphs);
                }}
              />
            </label>
          ))}

          <button
            type="button"
            onClick={() =>
              update("paragraphs", [...(form.paragraphs || []), ""])
            }
          >
            + Add Paragraph
          </button>

          {form.paragraphs?.length > 0 && (
            <button
              type="button"
              onClick={() =>
                update("paragraphs", form.paragraphs.slice(0, -1))
              }
            >
              Remove Last Paragraph
            </button>
          )}
        </>
      )}

      <button
        onClick={save}
        disabled={saving || uploadingImage || uploadingVideo}
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}
