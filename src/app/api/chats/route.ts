import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db/connect";
import { Chat } from "@/lib/db/models/Chat";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Middleware to verify token
function verifyToken(request: NextRequest) {
  const token = request.cookies.get("token")?.value || 
                request.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
  } catch {
    return null;
  }
}

// GET - Fetch all chats for user
export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const chats = await Chat.find({ userId: user.userId })
      .select("title createdAt updatedAt messages")
      .sort({ updatedAt: -1 })
      .limit(50);

    return NextResponse.json({ success: true, chats });
  } catch (error: any) {
    console.error("Get chats error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create new chat or send message
export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { chatId, message, title } = body;

    // Create new chat
    if (!chatId) {
      const newChat = await Chat.create({
        userId: user.userId,
        title: title || "New Chat",
        messages: [
          {
            role: "user",
            content: message,
            timestamp: new Date(),
          },
        ],
      });

      return NextResponse.json({
        success: true,
        chat: newChat,
      });
    }

    // Add message to existing chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    if (chat.userId.toString() !== user.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    chat.messages.push({
      role: "user",
      content: message,
      timestamp: new Date(),
    });

    await chat.save();

    return NextResponse.json({
      success: true,
      chat,
    });
  } catch (error: any) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete a chat
export async function DELETE(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get("chatId");

    if (!chatId) {
      return NextResponse.json({ error: "Chat ID required" }, { status: 400 });
    }

    const chat = await Chat.findOneAndDelete({
      _id: chatId,
      userId: user.userId,
    });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Chat deleted" });
  } catch (error: any) {
    console.error("Delete chat error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}