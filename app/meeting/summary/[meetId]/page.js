'use client';
import { notFound } from "next/navigation";
import { use, useEffect, useState } from "react";

export default function MeetingSummaryPage({ params }) {
    const resolvedParams = use(params);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notfound, setNotFound] = useState(false);

    useEffect(() => {
        async function fetchSummary() {
            const res = await fetch(`/api/meeting/summary/${resolvedParams.meetId}`);
            if (!res.ok) {
                setNotFound(true);
                setLoading(false);
                return;
            }
            const data = await res.json();
            setSummary(data.summary);
            setLoading(false);
        }
        fetchSummary();
    }, [resolvedParams?.meetId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading summary...</p>
                </div>
            </div>
        );
    }

    if (notfound) {
        return notFound();
    }

    if (!summary) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">No Summary Available</h2>
                    <p className="text-gray-600">No summary data found for this meeting.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                        {summary.meetingTitle || "Meeting Summary"}
                    </h1>
                    {summary.date && (
                        <p className="text-gray-600">
                            {new Date(summary.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    )}
                </div>

                {/* Overview Section */}
                {summary.shortOverview && (
                    <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Overview</h2>
                        <p className="text-gray-700 leading-relaxed">{summary.shortOverview}</p>
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Key Decisions */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Key Decisions</h2>
                        {summary.keyDecisions && summary.keyDecisions.length > 0 ? (
                            <ul className="space-y-2">
                                {summary.keyDecisions.map((decision, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <span className="text-blue-600 mt-1">•</span>
                                        <span className="text-gray-700">{decision}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500">No decisions recorded.</p>
                        )}
                    </div>

                    {/* Action Items */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Action Items</h2>
                        {summary.actionItems && summary.actionItems.length > 0 ? (
                            <ul className="space-y-3">
                                {summary.actionItems.map((item, index) => (
                                    <li key={index} className="border-l-2 border-green-500 pl-3 py-1">
                                        <p className="text-gray-800 font-medium">{item.task}</p>
                                        {item.owner && (
                                            <p className="text-sm text-gray-600">Owner: {item.owner}</p>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500">No action items.</p>
                        )}
                    </div>
                </div>

                {/* Topics */}
                {summary?.topics && summary?.topics?.length > 0 && (
                    <div className="mt-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Topics Covered</h2>
                        <div className="flex flex-wrap gap-2">
                            {summary.topics.map((topic, index) => (
                                <span
                                    key={index}
                                    className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                >
                                    {topic}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}