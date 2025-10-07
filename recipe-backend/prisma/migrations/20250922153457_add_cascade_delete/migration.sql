-- DropForeignKey
ALTER TABLE "public"."Collection" DROP CONSTRAINT "Collection_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CollectionRecipe" DROP CONSTRAINT "CollectionRecipe_collectionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CollectionRecipe" DROP CONSTRAINT "CollectionRecipe_recipeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Favorite" DROP CONSTRAINT "Favorite_recipeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Favorite" DROP CONSTRAINT "Favorite_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Rating" DROP CONSTRAINT "Rating_recipeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Rating" DROP CONSTRAINT "Rating_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Recipe" DROP CONSTRAINT "Recipe_authorId_fkey";

-- AddForeignKey
ALTER TABLE "public"."Recipe" ADD CONSTRAINT "Recipe_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Rating" ADD CONSTRAINT "Rating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Rating" ADD CONSTRAINT "Rating_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "public"."Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Favorite" ADD CONSTRAINT "Favorite_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "public"."Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Collection" ADD CONSTRAINT "Collection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CollectionRecipe" ADD CONSTRAINT "CollectionRecipe_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "public"."Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CollectionRecipe" ADD CONSTRAINT "CollectionRecipe_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "public"."Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
