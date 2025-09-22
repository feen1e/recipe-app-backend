import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

import { cleanDatabase } from "./clean-database";

const prisma = new PrismaClient();

export async function seedDatabase() {
  await cleanDatabase();

  const saltRounds = 10;
  const adminPassword = await bcrypt.hash("admin123", saltRounds);
  const userPassword = await bcrypt.hash("user123", saltRounds);

  const _adminUser = await prisma.user.create({
    data: {
      username: "admin_user",
      email: "admin@example.com",
      password: adminPassword,
      role: Role.ADMIN,
      bio: "I am the administrator.",
    },
  });

  const normalUser = await prisma.user.create({
    data: {
      username: "normal_user",
      email: "user@example.com",
      password: userPassword,
      role: Role.USER,
      bio: "I am a regular user.",
    },
  });

  const _anotherUser = await prisma.user.create({
    data: {
      username: "another_user",
      email: "another@example.com",
      password: userPassword,
      role: Role.USER,
      bio: "I am another regular user.",
    },
  });

  const exampleRecipe = await prisma.recipe.create({
    data: {
      title: "Spaghetti Carbonara",
      description:
        "A classic Italian pasta dish with eggs, hard cheese, cured pork, and black pepper.",
      ingredients: {
        eggs: "2 large eggs",
        cheese: "50g grated Pecorino Romano",
        pork: "100g guanciale or pancetta",
        pasta: "200g spaghetti",
      },
      steps: [
        "Cook the pasta according to package directions.",
        "While pasta is cooking, fry the pork until crispy.",
        "Whisk eggs and cheese together.",
        "Drain pasta, add to pan with pork, then quickly add egg mixture and toss to combine. The heat of the pasta will cook the eggs into a creamy sauce.",
      ],
      imageUrl: "https://example.com/spaghetti-carbonara.jpg",
      authorId: normalUser.id,
    },
  });

  const _secondRecipe = await prisma.recipe.create({
    data: {
      title: "Chicken Curry",
      description:
        "A flavorful chicken curry made with a blend of spices, tomatoes, and coconut milk.",
      ingredients: {
        chicken: "500g chicken thighs, cut into pieces",
        spices: "2 tsp curry powder, 1 tsp turmeric, 1 tsp cumin",
        tomatoes: "400g canned tomatoes",
        coconutMilk: "200ml coconut milk",
      },
      steps: [
        "Sauté spices in oil until fragrant.",
        "Add chicken pieces and brown on all sides.",
        "Add tomatoes and simmer until chicken is cooked through.",
        "Stir in coconut milk and cook for another 5 minutes.",
      ],
      imageUrl: "https://example.com/chicken-curry.jpg",
      authorId: normalUser.id,
    },
  });

  const _userRating = await prisma.rating.create({
    data: {
      stars: 5,
      review: "Absolutely delicious and easy to make!",
      userId: normalUser.id,
      recipeId: exampleRecipe.id,
    },
  });

  await prisma.favorite.create({
    data: {
      userId: normalUser.id,
      recipeId: exampleRecipe.id,
    },
  });

  const _userCollection = await prisma.collection.create({
    data: {
      name: "My Favorite Pasta Dishes",
      description: "A collection of my go-to pasta recipes.",
      userId: normalUser.id,
      recipes: {
        create: {
          recipeId: exampleRecipe.id,
        },
      },
    },
  });
}
