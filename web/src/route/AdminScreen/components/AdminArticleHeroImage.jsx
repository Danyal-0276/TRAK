import React from 'react';
import ArticleCardImage from '../../../components/ArticleCardImage';
import { getAdminArticleImageProxyUrl } from '../../../api/adminApi';

/** Admin feed / review hero image (JWT proxy fallback). */
export default function AdminArticleHeroImage(props) {
  return <ArticleCardImage {...props} getProxyUrl={getAdminArticleImageProxyUrl} />;
}
