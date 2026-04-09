'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSocialAccounts } from '@/hooks/useSocialAccounts';
import { postsService } from '@/services/posts.service';
import Navbar from '@/components/layout/Navbar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import toast from 'react-hot-toast';
import type { AiGeneratedPost, GeneratePostInput } from '@/types';

export default function CreatePostPage() {
  const { user, loading: authLoading } = useAuth();
  const { accounts, loading: accountsLoading } = useSocialAccounts();
  const router = useRouter();

  // AI generation form
  const [aiInput, setAiInput] = useState<GeneratePostInput>({
    postDescription: '',
    goal: '',
    audience: '',
    tone: 'Professional',
    mediaType: 'image',
    mandatoryKeywords: [],
    brandName: '',
  });
  const [keywordsInput, setKeywordsInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [aiGenerated, setAiGenerated] = useState<AiGeneratedPost | null>(null);

  // Post form
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [targetPlatform, setTargetPlatform] = useState('facebook');
  const [socialAccountId, setSocialAccountId] = useState('');
  const [publishMode, setPublishMode] = useState('now');
  const [scheduledAt, setScheduledAt] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleGenerateAi = async () => {
    if (!aiInput.postDescription.trim()) {
      toast.error('Please enter a post description');
      return;
    }

    setGenerating(true);
    try {
      const input: GeneratePostInput = {
        ...aiInput,
        mandatoryKeywords: keywordsInput
          ? keywordsInput.split(',').map((k) => k.trim()).filter(Boolean)
          : [],
      };

      const result = await postsService.generateWithAi(input);
      setAiGenerated(result);
      setTitle(result.title);
      setCaption(result.caption);
      setHashtags(result.hashtags);
      setImagePrompt(result.imagePrompt);
      toast.success('AI content generated!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'AI generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleApplyVariation = (variation: { caption: string; hashtags: string[] }) => {
    setCaption(variation.caption);
    setHashtags(variation.hashtags);
    toast.success('Variation applied');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!socialAccountId) {
      toast.error('Please select a social account');
      return;
    }

    if (!caption.trim()) {
      toast.error('Caption is required');
      return;
    }

    if (publishMode === 'schedule' && !scheduledAt) {
      toast.error('Please select a schedule date and time');
      return;
    }

    setSubmitting(true);
    try {
      await postsService.createPost({
        title: title || 'Untitled Post',
        caption,
        hashtags,
        imagePrompt,
        imageUrl: imageUrl || undefined,
        targetPlatform,
        socialAccountId,
        publishMode,
        scheduledAt: publishMode === 'schedule' ? scheduledAt : undefined,
        aiInput: aiInput.postDescription ? aiInput : undefined,
        aiOutput: aiGenerated || undefined,
      });

      toast.success(
        publishMode === 'now'
          ? 'Post is being published!'
          : publishMode === 'schedule'
            ? 'Post scheduled successfully!'
            : 'Post saved as draft!',
      );
      router.push('/posts/history');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || accountsLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center mt-32">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  const filteredAccounts = accounts.filter((a) => {
    if (targetPlatform === 'both') return true;
    return a.platform === targetPlatform;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Post</h1>

        <div className="space-y-6">
          {/* AI Generation Section */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Generate with AI</h2>
              <p className="text-sm text-gray-500 mt-1">
                Describe your post and let AI generate the content for you.
              </p>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Post Description *
                  </label>
                  <textarea
                    rows={3}
                    value={aiInput.postDescription}
                    onChange={(e) =>
                      setAiInput({ ...aiInput, postDescription: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="E.g., Launch of our new eco-friendly product line"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Goal</label>
                    <input
                      type="text"
                      value={aiInput.goal}
                      onChange={(e) => setAiInput({ ...aiInput, goal: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      placeholder="E.g., Increase engagement"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
                    <input
                      type="text"
                      value={aiInput.audience}
                      onChange={(e) => setAiInput({ ...aiInput, audience: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      placeholder="E.g., Millennials interested in tech"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tone</label>
                    <select
                      value={aiInput.tone}
                      onChange={(e) => setAiInput({ ...aiInput, tone: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    >
                      <option value="Professional">Professional</option>
                      <option value="Casual">Casual</option>
                      <option value="Humorous">Humorous</option>
                      <option value="Inspirational">Inspirational</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
                    <input
                      type="text"
                      value={aiInput.brandName}
                      onChange={(e) => setAiInput({ ...aiInput, brandName: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      placeholder="E.g., GreenLife Co."
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Keywords (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={keywordsInput}
                    onChange={(e) => setKeywordsInput(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="E.g., sustainable, eco-friendly, green"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleGenerateAi}
                  disabled={generating}
                  className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {generating ? 'Generating...' : 'Generate with AI'}
                </button>
              </div>
            </CardBody>
          </Card>

          {/* AI Variations */}
          {aiGenerated && aiGenerated.variations.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">AI Variations</h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {aiGenerated.variations.map((variation, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <p className="text-sm text-gray-700 mb-2">{variation.caption}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {variation.hashtags.map((tag, i) => (
                            <span
                              key={i}
                              className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleApplyVariation(variation)}
                          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Use this
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Post Form */}
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">Post Details</h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      placeholder="Post title (for your reference)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Caption *
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      placeholder="Your post caption..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hashtags</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {hashtags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => setHashtags(hashtags.filter((_, i) => i !== index))}
                            className="ml-1 text-blue-400 hover:text-blue-600"
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Type a hashtag and press Enter"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const value = (e.target as HTMLInputElement).value.trim().replace('#', '');
                          if (value && !hashtags.includes(value)) {
                            setHashtags([...hashtags, value]);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image Prompt (AI-generated)
                    </label>
                    <textarea
                      rows={2}
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      placeholder="Prompt to generate an image..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL (optional)
                    </label>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Target Platform *
                      </label>
                      <select
                        value={targetPlatform}
                        onChange={(e) => {
                          setTargetPlatform(e.target.value);
                          setSocialAccountId('');
                        }}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      >
                        <option value="facebook">Facebook</option>
                        <option value="instagram">Instagram</option>
                        <option value="both">Both</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Social Account *
                      </label>
                      <select
                        required
                        value={socialAccountId}
                        onChange={(e) => setSocialAccountId(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      >
                        <option value="">Select an account</option>
                        {filteredAccounts.map((account) => (
                          <option key={account._id} value={account._id}>
                            {account.pageName || account.platformUsername} ({account.platform})
                          </option>
                        ))}
                      </select>
                      {filteredAccounts.length === 0 && (
                        <p className="text-xs text-red-500 mt-1">
                          No accounts found. Please connect a social account first.
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Publishing
                    </label>
                    <div className="flex space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          value="now"
                          checked={publishMode === 'now'}
                          onChange={(e) => setPublishMode(e.target.value)}
                          className="form-radio text-primary-600"
                        />
                        <span className="ml-2 text-sm text-gray-700">Post Now</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          value="schedule"
                          checked={publishMode === 'schedule'}
                          onChange={(e) => setPublishMode(e.target.value)}
                          className="form-radio text-primary-600"
                        />
                        <span className="ml-2 text-sm text-gray-700">Schedule</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          value="draft"
                          checked={publishMode === 'draft'}
                          onChange={(e) => setPublishMode(e.target.value)}
                          className="form-radio text-primary-600"
                        />
                        <span className="ml-2 text-sm text-gray-700">Save as Draft</span>
                      </label>
                    </div>
                  </div>
                  {publishMode === 'schedule' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Schedule Date & Time *
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={scheduledAt}
                        onChange={(e) => setScheduledAt(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      />
                    </div>
                  )}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => router.back()}
                      className="px-6 py-2.5 bg-white text-gray-700 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      {submitting
                        ? 'Saving...'
                        : publishMode === 'now'
                          ? 'Publish Now'
                          : publishMode === 'schedule'
                            ? 'Schedule Post'
                            : 'Save Draft'}
                    </button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </form>
        </div>
      </main>
    </div>
  );
}
