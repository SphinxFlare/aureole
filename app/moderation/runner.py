# # app/moderation/runner.py

# import asyncio
# from typing import Union
# from uuid import UUID

# from sqlalchemy import update
# from sqlalchemy.ext.asyncio import AsyncSession

# from db.session import async_session
# from models.message_model import Message
# from utils.socket_manager import manager
# from .filter import moderate_message


# async def _run_post_moderation(
#     message_id: UUID,
#     content: str,
#     receiver_id: Union[str, UUID],
#     sender_id: Union[str, UUID],
# ) -> None:
#     """
#     Internal worker:
#     - runs moderation
#     - updates DB (ONLY flags, DOES NOT delete content)
#     - optionally sends placeholder to BOTH users
#     """

#     result = moderate_message(content)
#     print(
#         f"[MOD] message={message_id} delete={result.delete} "
#         f"flag={result.flag} reasons={result.reasons}"
#     )

#     # Nothing to do if no issues
#     if not (result.delete or result.flag):
#         return

#     # ------------------------
#     # 1. Update DB  (FLAG ONLY)
#     # ------------------------
#     async with async_session() as db:
#         values = {}

#         # ⚠️ Do NOT touch content here anymore
#         if result.delete:
#             values["content"] = None

#         if result.flag or result.delete:
#             # Even for delete, we just flag it now
#             values["is_flagged"] = True
#             values["flagged_reason"] = ";".join(result.reasons)

#         if values:
#             await db.execute(
#                 update(Message)
#                 .where(Message.id == message_id)
#                 .values(**values)
#             )
#             await db.commit()

#     # ------------------------
#     # 2. Placeholder event (optional)
#     # ------------------------
#     # We can still send a UI placeholder, but DB keeps the original text.
#     if result.delete:
#         placeholder_text = "Message removed due to guidelines."

#         # Send to receiver
#         await manager.send_personal_message(str(receiver_id), {
#             "type": "message_placeholder",
#             "message_id": str(message_id),
#             "placeholder": placeholder_text,
#             "sender_id": str(sender_id),
#         })

#         # Send to sender
#         await manager.send_personal_message(str(sender_id), {
#             "type": "message_placeholder",
#             "message_id": str(message_id),
#             "placeholder": placeholder_text,
#             "sender_id": str(sender_id),
#         })


# def schedule_post_moderation(
#     message_id: Union[str, UUID],
#     content: str,
#     receiver_id: Union[str, UUID],
#     sender_id: Union[str, UUID],
# ) -> None:

#     if isinstance(message_id, str):
#         message_id = UUID(message_id)

#     asyncio.create_task(
#         _run_post_moderation(
#             message_id=message_id,
#             content=content,
#             receiver_id=str(receiver_id),
#             sender_id=str(sender_id),
#         )
#     )


# app/moderation/runner.py

import asyncio
from typing import Union
from uuid import UUID

from sqlalchemy import update

from db.session import async_session
from models.message_model import Message
from utils.socket_manager import manager
from .filter import moderate_message


async def _run_post_moderation(
    message_id: UUID,
    content: str,
    receiver_id: Union[str, UUID],
    sender_id: Union[str, UUID],
) -> None:
    """
    Internal worker:
    - runs moderation
    - updates DB (content + flags)
    - sends a single WS 'message_moderated' event to BOTH users when delete=True
    """

    result = moderate_message(content)
    print(
        f"[MOD] message={message_id} delete={result.delete} "
        f"flag={result.flag} reasons={result.reasons}"
    )

    # Nothing to do if no issues at all
    if not (result.delete or result.flag):
        return

    # ------------------------
    # 1. Update DB
    # ------------------------
    async with async_session() as db:
        values = {}

        # If we delete → wipe content
        if result.delete:
            values["content"] = "Message removed due to guidelines."

        if result.flag or result.delete:
            values["is_flagged"] = True
            values["flagged_reason"] = ";".join(result.reasons)

        if values:
            await db.execute(
                update(Message)
                .where(Message.id == message_id)
                .values(**values)
            )
            await db.commit()
            print(f"[MOD] DB updated for message={message_id} values={values}")

    # ------------------------
    # 2. WS placeholder to both users (only when delete=True)
    # ------------------------
    if result.delete:
        placeholder_text = "Message removed due to guidelines."

        event = {
            "type": "message_moderated",
            "message_id": str(message_id),
            "placeholder": placeholder_text,
            "sender_id": str(sender_id),
            "receiver_id": str(receiver_id),
            "message_type": "text",
        }

        print(f"[MOD] sending moderation WS event:", event)

        # Receiver
        sent_recv = await manager.send_personal_message(str(receiver_id), event)
        # Sender
        sent_sender = await manager.send_personal_message(str(sender_id), event)

        print(
            f"[MOD] moderation WS sent: "
            f"receiver={receiver_id} ok={sent_recv}, "
            f"sender={sender_id} ok={sent_sender}"
        )


def schedule_post_moderation(
    message_id: Union[str, UUID],
    content: str,
    receiver_id: Union[str, UUID],
    sender_id: Union[str, UUID],
) -> None:

    if isinstance(message_id, str):
        message_id = UUID(message_id)

    asyncio.create_task(
        _run_post_moderation(
            message_id=message_id,
            content=content,
            receiver_id=str(receiver_id),
            sender_id=str(sender_id),
        )
    )