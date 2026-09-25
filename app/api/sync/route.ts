import { NextRequest, NextResponse } from 'next/server';
import {
  loadServerCloudStore,
  upsertAccountInServer,
  batchUpsertAccountsInServer,
  upsertFramesInServer,
  upsertDharmaInServer,
  upsertArtifactsInServer,
  upsertTitlesInServer,
  deleteAccountInServer,
  deleteFrameInServer,
  replaceFramesInServer,
  deleteDharmaInServer,
  replaceDharmaInServer,
  deleteArtifactInServer,
  replaceArtifactsInServer,
  deleteTitleInServer,
  replaceTitlesInServer,
  updateSystemConfigInServer,
  saveServerCloudStore,
} from '@/lib/server/cloudStore';
import { encryptData, decryptData, EncryptedPayload } from '@/lib/server/encryptedDb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const store = loadServerCloudStore();

    // Bảo mật: Không lưu trữ hoặc trả về danh sách đạo tịch cá nhân trên máy chủ
    return NextResponse.json({
      success: true,
      accounts: [],
      customFrames: store.customFrames,
      dharmaIdols: store.dharmaIdols,
      customArtifacts: store.customArtifacts,
      customTitles: store.customTitles,
      systemConfig: store.systemConfig,
      lastUpdated: store.lastUpdated,
      version: store.version,
      isEncrypted: true,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Lỗi đồng bộ máy chủ';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      action,
      payload,
      account,
      frames,
      dharmaIdols,
      artifacts,
      titles,
      systemConfig,
      encryptedPayload,
    } = body;

    const store = loadServerCloudStore();

    switch (action) {
      case 'SYNC_ACCOUNT': {
        const accToSave = account || payload?.account;
        if (!accToSave || !accToSave.id || !accToSave.username) {
          return NextResponse.json({ success: false, error: 'Thiếu dữ liệu tài khoản' }, { status: 400 });
        }
        const updated = upsertAccountInServer(accToSave);
        return NextResponse.json({
          success: true,
          message: 'Đã đồng bộ tài khoản lên Tiên Giới Đám Mây (Mã hóa an toàn)',
          account: updated,
          lastUpdated: Date.now(),
        });
      }

      case 'SYNC_FRAMES': {
        const framesToSave = frames || payload?.frames;
        if (!Array.isArray(framesToSave)) {
          return NextResponse.json({ success: false, error: 'Dữ liệu khung không hợp lệ' }, { status: 400 });
        }
        const updated = upsertFramesInServer(framesToSave);
        return NextResponse.json({
          success: true,
          message: 'Đã lưu trữ và mã hóa khung avatar lên máy chủ',
          customFrames: updated,
          lastUpdated: Date.now(),
        });
      }

      case 'SYNC_DHARMA': {
        const idolsToSave = dharmaIdols || payload?.dharmaIdols;
        if (!Array.isArray(idolsToSave)) {
          return NextResponse.json({ success: false, error: 'Dữ liệu pháp tướng không hợp lệ' }, { status: 400 });
        }
        const updated = upsertDharmaInServer(idolsToSave);
        return NextResponse.json({
          success: true,
          message: 'Đã lưu trữ và mã hóa pháp tướng lên máy chủ',
          dharmaIdols: updated,
          lastUpdated: Date.now(),
        });
      }

      case 'SYNC_ARTIFACTS': {
        const artifactsToSave = artifacts || payload?.artifacts;
        if (!Array.isArray(artifactsToSave)) {
          return NextResponse.json({ success: false, error: 'Dữ liệu pháp bảo không hợp lệ' }, { status: 400 });
        }
        const updated = upsertArtifactsInServer(artifactsToSave);
        return NextResponse.json({
          success: true,
          message: 'Đã lưu trữ và mã hóa pháp bảo lên máy chủ',
          customArtifacts: updated,
          lastUpdated: Date.now(),
        });
      }

      case 'SYNC_TITLES': {
        const titlesToSave = titles || payload?.titles;
        if (!Array.isArray(titlesToSave)) {
          return NextResponse.json({ success: false, error: 'Dữ liệu danh hiệu không hợp lệ' }, { status: 400 });
        }
        const updated = upsertTitlesInServer(titlesToSave);
        return NextResponse.json({
          success: true,
          message: 'Đã lưu trữ và mã hóa danh hiệu lên máy chủ',
          customTitles: updated,
          lastUpdated: Date.now(),
        });
      }

      case 'DELETE_FRAME': {
        const frameId = body.id || payload?.id;
        if (!frameId) {
          return NextResponse.json({ success: false, error: 'Thiếu frameId' }, { status: 400 });
        }
        const updated = deleteFrameInServer(frameId);
        return NextResponse.json({
          success: true,
          message: 'Đã xóa khung viền khỏi máy chủ',
          customFrames: updated,
          lastUpdated: Date.now(),
        });
      }

      case 'REPLACE_FRAMES': {
        const framesToSave = frames || payload?.frames;
        if (!Array.isArray(framesToSave)) {
          return NextResponse.json({ success: false, error: 'Dữ liệu khung không hợp lệ' }, { status: 400 });
        }
        const updated = replaceFramesInServer(framesToSave);
        return NextResponse.json({
          success: true,
          message: 'Đã cập nhật danh sách khung viền',
          customFrames: updated,
          lastUpdated: Date.now(),
        });
      }

      case 'DELETE_DHARMA': {
        const dharmaId = body.id || payload?.id;
        if (!dharmaId) {
          return NextResponse.json({ success: false, error: 'Thiếu dharmaId' }, { status: 400 });
        }
        const updated = deleteDharmaInServer(dharmaId);
        return NextResponse.json({
          success: true,
          message: 'Đã xóa pháp tướng khỏi máy chủ',
          dharmaIdols: updated,
          lastUpdated: Date.now(),
        });
      }

      case 'REPLACE_DHARMA': {
        const idolsToSave = dharmaIdols || payload?.dharmaIdols;
        if (!Array.isArray(idolsToSave)) {
          return NextResponse.json({ success: false, error: 'Dữ liệu pháp tướng không hợp lệ' }, { status: 400 });
        }
        const updated = replaceDharmaInServer(idolsToSave);
        return NextResponse.json({
          success: true,
          message: 'Đã cập nhật danh sách pháp tướng',
          dharmaIdols: updated,
          lastUpdated: Date.now(),
        });
      }

      case 'DELETE_ARTIFACT': {
        const artifactId = body.id || payload?.id;
        if (!artifactId) {
          return NextResponse.json({ success: false, error: 'Thiếu artifactId' }, { status: 400 });
        }
        const updated = deleteArtifactInServer(artifactId);
        return NextResponse.json({
          success: true,
          message: 'Đã xóa pháp bảo khỏi máy chủ',
          customArtifacts: updated,
          lastUpdated: Date.now(),
        });
      }

      case 'REPLACE_ARTIFACTS': {
        const artifactsToSave = artifacts || payload?.artifacts;
        if (!Array.isArray(artifactsToSave)) {
          return NextResponse.json({ success: false, error: 'Dữ liệu pháp bảo không hợp lệ' }, { status: 400 });
        }
        const updated = replaceArtifactsInServer(artifactsToSave);
        return NextResponse.json({
          success: true,
          message: 'Đã cập nhật danh sách pháp bảo',
          customArtifacts: updated,
          lastUpdated: Date.now(),
        });
      }

      case 'DELETE_TITLE': {
        const titleId = body.id || payload?.id;
        if (!titleId) {
          return NextResponse.json({ success: false, error: 'Thiếu titleId' }, { status: 400 });
        }
        const updated = deleteTitleInServer(titleId);
        return NextResponse.json({
          success: true,
          message: 'Đã xóa danh hiệu khỏi máy chủ',
          customTitles: updated,
          lastUpdated: Date.now(),
        });
      }

      case 'REPLACE_TITLES': {
        const titlesToSave = titles || payload?.titles;
        if (!Array.isArray(titlesToSave)) {
          return NextResponse.json({ success: false, error: 'Dữ liệu danh hiệu không hợp lệ' }, { status: 400 });
        }
        const updated = replaceTitlesInServer(titlesToSave);
        return NextResponse.json({
          success: true,
          message: 'Đã cập nhật danh sách danh hiệu',
          customTitles: updated,
          lastUpdated: Date.now(),
        });
      }

      case 'DELETE_USER':
      case 'DELETE_ACCOUNT': {
        const accountId = body.id || body.userId || payload?.id || payload?.userId;
        if (!accountId) {
          return NextResponse.json({ success: false, error: 'Thiếu accountId' }, { status: 400 });
        }
        const updated = deleteAccountInServer(accountId);
        return NextResponse.json({
          success: true,
          message: 'Đã xóa tài khoản vĩnh viễn khỏi hệ thống',
          accounts: updated,
          lastUpdated: Date.now(),
        });
      }

      case 'SYNC_SYSTEM_CONFIG': {
        const configToSave = systemConfig || payload?.systemConfig;
        if (!configToSave) {
          return NextResponse.json({ success: false, error: 'Dữ liệu cấu hình hệ thống không hợp lệ' }, { status: 400 });
        }
        const updated = updateSystemConfigInServer(configToSave);
        return NextResponse.json({
          success: true,
          message: 'Đã lưu cấu hình khởi tạo tài khoản vào Database mã hóa',
          systemConfig: updated,
          lastUpdated: Date.now(),
        });
      }

      case 'EXPORT_ENCRYPTED_DB': {
        const currentStore = loadServerCloudStore();
        const encrypted = encryptData(currentStore);
        return NextResponse.json({
          success: true,
          encryptedBackup: encrypted,
          timestamp: Date.now(),
        });
      }

      case 'RESTORE_ENCRYPTED_DB': {
        if (!encryptedPayload) {
          return NextResponse.json({ success: false, error: 'Thiếu gói tin mã hóa khôi phục' }, { status: 400 });
        }
        const restoredData = decryptData<any>(encryptedPayload as EncryptedPayload);
        if (!restoredData || !Array.isArray(restoredData.accounts)) {
          return NextResponse.json({ success: false, error: 'Dữ liệu giải mã không hợp lệ' }, { status: 400 });
        }
        saveServerCloudStore(restoredData);
        return NextResponse.json({
          success: true,
          message: 'Khôi phục cơ sở dữ liệu mã hóa thành công',
          data: restoredData,
        });
      }

      case 'FULL_MERGE': {
        if (payload?.account) {
          upsertAccountInServer(payload.account);
        }
        if (Array.isArray(payload?.frames)) {
          upsertFramesInServer(payload.frames);
        }
        if (Array.isArray(payload?.dharmaIdols)) {
          upsertDharmaInServer(payload.dharmaIdols);
        }
        if (Array.isArray(payload?.artifacts)) {
          upsertArtifactsInServer(payload.artifacts);
        }
        if (Array.isArray(payload?.titles)) {
          upsertTitlesInServer(payload.titles);
        }
        if (payload?.systemConfig) {
          updateSystemConfigInServer(payload.systemConfig);
        }
        if (Array.isArray(payload?.accounts) && payload.accounts.length > 0) {
          batchUpsertAccountsInServer(payload.accounts);
        }

        const freshStore = loadServerCloudStore();
        return NextResponse.json({
          success: true,
          message: 'Đồng bộ toàn bộ dữ liệu Tiên Giới thành công',
          data: freshStore,
        });
      }

      default: {
        return NextResponse.json({ success: false, error: 'Hành động không hợp lệ' }, { status: 400 });
      }
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Lỗi xử lý đồng bộ';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
