import { Path, type PathBuilder } from 'app/utils/routes';

import { pages as adminPages, paths as adminPaths } from './Admin/routes';
import { pages as animePages, paths as animePaths } from './Anime/routes';
import {
  modals as authModals,
  pages as authPages,
  paths as authPaths,
} from './Auth/routes';
import { pages as mangaPages, paths as mangaPaths } from './Manga/routes';
import { paths as profilePaths } from './Profile/routes';

export const pages = (
  <>
    {authPages}
    {animePages}
    {mangaPages}
    {adminPages}
  </>
);
export const modals = <>{authModals}</>;
export const paths = {
  anime: animePaths,
  manga: mangaPaths,
  auth: authPaths,
  profile: profilePaths,
  admin: adminPaths,
  post: ({ id }: { id: string }) => new Path(`/posts/${id}`),
  comment: ({ id }: { id: string }) => new Path(`/comments/${id}`),
} satisfies PathBuilder;
