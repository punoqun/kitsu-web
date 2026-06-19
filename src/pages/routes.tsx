import { Path, type PathBuilder } from 'app/utils/routes';

import { pages as adminPages, paths as adminPaths } from './Admin/routes';
import { pages as animePages, paths as animePaths } from './Anime/routes';
import {
  modals as authModals,
  pages as authPages,
  paths as authPaths,
} from './Auth/routes';
import { pages as commentPages } from './Comment/routes';
import { pages as explorePages, paths as explorePaths } from './Explore/routes';
import { pages as homePages } from './Home/routes';
import { pages as mangaPages, paths as mangaPaths } from './Manga/routes';
import { pages as postPages } from './Post/routes';
import { pages as profilePages, paths as profilePaths } from './Profile/routes';
import { pages as searchPages, paths as searchPaths } from './Search/routes';
import { pages as settingsPages, paths as settingsPaths } from './Settings/routes';

export const pages = (
  <>
    {homePages}
    {authPages}
    {animePages}
    {mangaPages}
    {adminPages}
    {profilePages}
    {postPages}
    {commentPages}
    {explorePages}
    {searchPages}
    {settingsPages}
  </>
);
export const modals = <>{authModals}</>;
export const paths = {
  anime: animePaths,
  manga: mangaPaths,
  auth: authPaths,
  profile: profilePaths,
  admin: adminPaths,
  explore: explorePaths,
  search: searchPaths,
  settings: settingsPaths,
  post: ({ id }: { id: string }) => new Path(`/posts/${id}`),
  comment: ({ id }: { id: string }) => new Path(`/comments/${id}`),
} satisfies PathBuilder;
